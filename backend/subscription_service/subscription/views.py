import logging
from datetime import timezone as dt_timezone

import stripe
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Subscription
from .permissions import IsJWTAuthenticated
from .serializers import SubscriptionSerializer
from .utils import generate_response

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


def _dispatch(event: str, payload: dict):
    try:
        from celery_s.automations import dispatch_automation_event

        dispatch_automation_event.delay(event, payload)
    except Exception as exc:
        logger.warning("[subscription] automation dispatch failed for %s: %s", event, exc)


def _stripe_timestamp_to_datetime(timestamp_value):
    if not timestamp_value:
        return None
    return timezone.datetime.fromtimestamp(timestamp_value, tz=dt_timezone.utc)


@csrf_exempt
@api_view(["GET"])
def get_subscription_plans(request):
    try:
        products = stripe.Product.list(active=True, limit=20)
        plans = []
        allowed_plans = ["Influencer", "Brand", "Both"]
        for product in products.auto_paging_iter():
            if product.name not in allowed_plans:
                continue

            prices = stripe.Price.list(product=product.id, active=True)
            price_list = []
            for price in prices.auto_paging_iter():
                if price.recurring:
                    price_list.append(
                        {
                            "price_id": price.id,
                            "amount": price.unit_amount / 100 if price.unit_amount else 0,
                            "currency": price.currency.upper(),
                            "interval": price.recurring.interval,
                        }
                    )

            if price_list:
                plans.append(
                    {
                        "product_id": product.id,
                        "name": product.name,
                        "description": product.description or "",
                        "prices": price_list,
                    }
                )

        return Response(generate_response("success", 200, plans), 200)
    except Exception as exc:
        return Response(generate_response("failure", 400, str(exc)), 400)


@api_view(["POST"])
@permission_classes([IsJWTAuthenticated])
def create_checkout_session(request):
    price_id = request.data.get("price_id")
    user_id = int(request.token_payload.get("user_id"))

    if Subscription.objects.filter(user=user_id).exists():
        return Response(
            generate_response(
                "failure",
                400,
                {},
                "You already have a subscription, please manage it from the billing portal.",
            ),
            status=400,
        )

    success_url = request.data.get("success_url", "https://thesocialmarket.ai/success=true")
    cancel_url = request.data.get("cancel_url", "https://thesocialmarket.ai/cancel=true")

    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=request.token_payload.get("email"),
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": user_id},
            allow_promotion_codes=True,
        )
        return Response(
            generate_response("success", 201, {"checkout_url": checkout_session.url}),
            201,
        )
    except Exception as exc:
        return Response(generate_response("failure", 400, str(exc)), 400)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            settings.STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        handle_checkout_session_completed(data)
    elif event_type == "customer.subscription.updated":
        handle_subscription_updated(data)
    elif event_type == "customer.subscription.deleted":
        handle_subscription_deleted(data)
    elif event_type == "invoice.payment_succeeded":
        handle_payment_succeeded(data)
    elif event_type == "invoice.payment_failed":
        handle_payment_failed(data)

    return HttpResponse(status=200)


def handle_checkout_session_completed(data):
    user_id = data.get("metadata", {}).get("user_id")
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    stripe.Subscription.modify(subscription_id, metadata={"user_id": user_id})
    subscription_details = stripe.Subscription.retrieve(subscription_id)

    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)["name"] if product_id else None

    Subscription.objects.update_or_create(
        user=user_id,
        defaults={
            "stripe_subscription_id": subscription_id,
            "stripe_customer_id": data.get("customer"),
            "status": "active",
            "plan_name": plan_name,
            "price_id": price_id,
            "product_id": product_id,
            "current_period_start": timezone.now(),
            "current_period_end": _stripe_timestamp_to_datetime(
                subscription_details.get("current_period_end")
            ),
        },
    )

    if user_id:
        _dispatch(
            "SUBSCRIPTION_ACTIVATED",
            {"user_id": int(user_id), "plan_name": plan_name},
        )


def handle_subscription_updated(data):
    subscription_id = data.get("id")
    if not subscription_id:
        return

    status = data.get("status")
    cancel_at_period_end = data.get("cancel_at_period_end")
    subscription_details = stripe.Subscription.retrieve(subscription_id)

    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)["name"] if product_id else None
    user_id = data.get("metadata", {}).get("user_id")

    Subscription.objects.update_or_create(
        stripe_subscription_id=subscription_id,
        defaults={
            "user": user_id,
            "stripe_customer_id": data.get("customer"),
            "status": status,
            "plan_name": plan_name,
            "price_id": price_id,
            "product_id": product_id,
            "current_period_start": timezone.now(),
            "current_period_end": _stripe_timestamp_to_datetime(
                subscription_details.get("current_period_end")
            ),
            "cancel_at_period_end": cancel_at_period_end,
        },
    )

    if status == "active" and user_id:
        _dispatch(
            "SUBSCRIPTION_ACTIVATED",
            {"user_id": int(user_id), "plan_name": plan_name},
        )


def handle_subscription_deleted(data):
    subscription_id = data.get("id")
    subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if subscription:
        subscription.status = "canceled"
        subscription.save()


def handle_payment_succeeded(data):
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    stripe_subscription = stripe.Subscription.retrieve(subscription_id)
    price = stripe_subscription["items"]["data"][0]["price"]
    product_id = price["product"]
    product = stripe.Product.retrieve(product_id)
    plan_name = product["name"]

    subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if subscription:
        subscription.status = "active"
        subscription.plan_name = plan_name
        subscription.price_id = price["id"]
        subscription.product_id = product_id
        subscription.current_period_start = _stripe_timestamp_to_datetime(
            stripe_subscription.get("current_period_start")
        )
        subscription.current_period_end = _stripe_timestamp_to_datetime(
            stripe_subscription.get("current_period_end")
        )
        subscription.save()


def handle_payment_failed(data):
    subscription_id = data.get("subscription")
    subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if subscription:
        subscription.status = "past_due"
        subscription.save()


@api_view(["GET"])
@permission_classes([IsJWTAuthenticated])
def get_user_subscription_information(request):
    user_id = int(request.token_payload.get("user_id"))
    try:
        subscription = Subscription.objects.filter(user=user_id)[0]
        serializer = SubscriptionSerializer(subscription)
        return Response(generate_response("success", 200, serializer.data), 200)
    except Exception as exc:
        return Response(generate_response("failure", 400, {}, str(exc)), 400)


@api_view(["GET"])
@permission_classes([IsJWTAuthenticated])
def get_customer_portal(request):
    user_id = request.token_payload.get("user_id")
    subscription = get_object_or_404(Subscription, user=user_id)

    try:
        session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            configuration=getattr(
                settings,
                "STRIPE_PORTAL_CONFIGURATION_ID",
                "bpc_1Sh2iiHgx3hXNxBFVOstkmaS",
            ),
            return_url=(
                f"{getattr(settings, 'SITE_BASE_URL', 'https://thesocialmarket.ai').rstrip('/')}/home_dashboard"
            ),
        )
        return Response(generate_response("success", 200, {"portal_url": session.url}), 200)
    except stripe.error.StripeError as exc:
        return Response({"status": "failure", "message": str(exc)}, status=400)
