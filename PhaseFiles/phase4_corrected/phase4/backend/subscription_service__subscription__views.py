"""
subscription_service/subscription/views.py — automation triggers added

After every successful Stripe webhook event, dispatches the corresponding
automation event so Celery handles the email/notification asynchronously.
"""

import json
import stripe
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import generate_response
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from .models import Subscription
from .permissions import IsJWTAuthenticated
from .serializers import SubscriptionSerializer
from django.shortcuts import get_object_or_404
import logging

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


def _dispatch(event: str, payload: dict):
    """Fire a Celery automation event without blocking."""
    try:
        from celery_s.automations import dispatch_automation_event
        dispatch_automation_event.delay(event, payload)
    except Exception as e:
        logger.warning(f"[subscription] automation dispatch failed for {event}: {e}")


@csrf_exempt
@api_view(['GET'])
def get_subscription_plans(request):
    try:
        products = stripe.Product.list(active=True, limit=20)
        plans = []
        allowed_plans = ['Micro-Influencer', "Businesses", "Both"]
        for product in products.auto_paging_iter():
            if product.name not in allowed_plans:
                continue
            prices = stripe.Price.list(product=product.id, active=True)
            price_list = []
            for price in prices.auto_paging_iter():
                if price.recurring:
                    price_list.append({
                        "price_id": price.id,
                        "amount": price.unit_amount / 100 if price.unit_amount else 0,
                        "currency": price.currency.upper(),
                        "interval": price.recurring.interval,
                    })
            if price_list:
                plans.append({
                    "product_id": product.id,
                    "name": product.name,
                    "description": product.description or "",
                    "prices": price_list,
                })
        return Response(generate_response("success", 200, plans), 200)
    except Exception as e:
        return Response(generate_response("failure", 400, str(e)), 400)


@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def create_checkout_session(request):
    price_id = request.data.get("price_id")
    user_id = int(request.token_payload.get('user_id'))

    if Subscription.objects.filter(user=user_id).count() > 0:
        return Response(
            generate_response("failure", 400, {}, "You already have a subscription. Manage it from the billing portal."),
            status=400
        )

    success_url = request.data.get("success_url", "https://thesocialmarket.ai/success=true")
    cancel_url = request.data.get("cancel_url", "https://thesocialmarket.ai/cancel=true")

    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=request.token_payload.get('email'),
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": user_id},
            allow_promotion_codes=True,
        )
        return Response(generate_response("success", 201, {'checkout_url': checkout_session.url}), 201)
    except Exception as e:
        return Response(generate_response("failure", 400, str(e)), 400)


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
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

    stripe.Subscription.modify(subscription_id, metadata={"user_id": user_id})
    subscription_details = stripe.Subscription.retrieve(subscription_id)

    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)['name']

    current_period_end_ts = subscription_details.get("current_period_end")
    current_period_end = (
        timezone.datetime.fromtimestamp(current_period_end_ts, tz=timezone.utc)
        if current_period_end_ts else None
    )

    subscription, created = Subscription.objects.update_or_create(
        user=user_id,
        defaults={
            'stripe_subscription_id': subscription_id,
            'stripe_customer_id': data.get("customer"),
            'status': "active",
            'plan_name': plan_name,
            'price_id': price_id,
            'product_id': product_id,
            'current_period_start': timezone.now(),
            'current_period_end': current_period_end,
        }
    )

    # ── Trigger: subscription activated email ──
    if user_id:
        _dispatch('SUBSCRIPTION_ACTIVATED', {
            'user_id': int(user_id),
            'plan_name': plan_name,
        })

    logger.info(f"[stripe] checkout completed — user {user_id}, plan {plan_name}")


def handle_subscription_updated(data):
    subscription_id = data.get("id")
    status = data.get("status")
    cancel_at_period_end = data.get("cancel_at_period_end")

    subscription_details = stripe.Subscription.retrieve(subscription_id)
    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)['name']

    current_period_end_ts = subscription_details.get("current_period_end")
    current_period_end = (
        timezone.datetime.fromtimestamp(current_period_end_ts, tz=timezone.utc)
        if current_period_end_ts else None
    )

    user_id = data.get("metadata", {}).get("user_id")

    Subscription.objects.update_or_create(
        stripe_subscription_id=subscription_id,
        defaults={
            'user': user_id,
            'stripe_customer_id': data.get("customer"),
            'status': status,
            'plan_name': plan_name,
            'price_id': price_id,
            'product_id': product_id,
            'current_period_start': timezone.now(),
            'current_period_end': current_period_end,
            'cancel_at_period_end': cancel_at_period_end,
        }
    )

    # ── Trigger: if newly active (e.g. after failed payment recovered) ──
    if status == 'active' and user_id:
        _dispatch('SUBSCRIPTION_ACTIVATED', {
            'user_id': int(user_id),
            'plan_name': plan_name,
        })


def handle_subscription_deleted(data):
    subscription_id = data.get("id")
    sub = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "canceled"
        sub.save()
        logger.info(f"[stripe] subscription canceled: {subscription_id}")


def handle_payment_succeeded(data):
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    stripe_subscription = stripe.Subscription.retrieve(subscription_id)
    price = stripe_subscription["items"]["data"][0]["price"]
    product_id = price["product"]
    plan_name = stripe.Product.retrieve(product_id)["name"]

    sub = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "active"
        sub.plan_name = plan_name
        sub.price_id = price["id"]
        sub.product_id = product_id

        current_period_start = stripe_subscription.get("current_period_start")
        current_period_end = stripe_subscription.get("current_period_end")
        if current_period_start and current_period_end:
            sub.current_period_start = timezone.datetime.fromtimestamp(current_period_start, tz=timezone.utc)
            sub.current_period_end = timezone.datetime.fromtimestamp(current_period_end, tz=timezone.utc)
        sub.save()


def handle_payment_failed(data):
    subscription_id = data.get("subscription")
    sub = Subscription.objects.filter(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "past_due"
        sub.save()


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_user_subscription_information(request):
    user_id = int(request.token_payload.get('user_id'))
    try:
        subs = Subscription.objects.filter(user=user_id)[0]
        serializer = SubscriptionSerializer(subs)
        return Response(generate_response("success", 200, serializer.data), 200)
    except (IndexError, Exception) as e:
        return Response(generate_response("failure", 400, {}, str(e)), 400)


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_customer_portal(request):
    user_id = request.token_payload.get("user_id")
    subscription = get_object_or_404(Subscription, user=user_id)

    try:
        session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            configuration=settings.STRIPE_PORTAL_CONFIGURATION_ID,
            return_url=f"{settings.SITE_BASE_URL}/home_dashboard",
        )
        return Response(generate_response("success", 200, {"portal_url": session.url}), 200)
    except stripe.error.StripeError as e:
        return Response({"status": "failure", "message": str(e)}, status=400)
