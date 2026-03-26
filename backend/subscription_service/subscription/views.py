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

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@api_view(['GET'])
def get_subscription_plans(request):
    try:
        products = stripe.Product.list(active=True, limit=20)
        plans = []
        allowed_plans = ['Influencer', "Brand", "Both"]
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

        response = generate_response("success", 200, plans)
        return Response(
            response, 200
        )

    except Exception as e:
        response = generate_response("failure", 400, str(e))
        return Response(
            response, 400
        )


@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def create_checkout_session(request):
    price_id = request.data.get("price_id")
    user_id = int(request.token_payload.get('user_id'))

    s = Subscription.objects.filter(user=user_id)
    if s.count() > 0:
        response = generate_response(
            "failure", 400, {}, "You already have a subscription, please manage it from the billing portal."
        )

        return Response(
            response, status=400
        )
    
    sucees_url = request.data.get("success_url", "http://example.com/success=true")
    cancel_url = request.data.get("cancel_url", "http://example.com/cancel=true")
    print("DEBUG >>>")
    print(sucees_url)
    print("DEBUG >>>")
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=request.token_payload.get('email'),
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{sucees_url}", # ?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=f"{cancel_url}",
            metadata={"user_id": user_id}, 
            allow_promotion_codes=True,
        )
        data = {
            'checkout_url': checkout_session.url
        }
        response = generate_response("success", 201, data)
        return Response(
            response, 201
        )
    except Exception as e:
        response = generate_response("failure", 400, str(e))
        raise e


@csrf_exempt
def stripe_webhook(request):
    print('I am here')
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    event_type = event["type"]
    data = event["data"]["object"]

    print(event_type)

    if event_type == "checkout.session.completed":
        handle_checkout_session_completed(data)

    elif event_type == "customer.subscription.updated":
        handle_subscription_updated(data)

    elif event_type == "customer.subscription.deleted":
        handle_subscription_deleted(data)

    elif event_type == "invoice.payment_succeeded":
        handle_payment_succeeded(data)
        # handle_subscription_updated(data)

    elif event_type == "invoice.payment_failed":
        handle_payment_failed(data)

    return HttpResponse(status=200)


# def handle_checkout_session_completed(data):
#     user_id = data.get("metadata", {}).get("user_id")
#     subscription_id = data.get("subscription")
#     customer_email = data.get("customer_email")


#     stripe.Subscription.modify(
#         subscription_id,
#         metadata={"user_id": user_id}
#     )

#     subscription_details = stripe.Subscription.retrieve(subscription_id)

#     # print(f"Subscription details: {subscription_details}")

#     plan = subscription_details.get("plan", {})
#     price_id = plan.get("id")
#     product_id = plan.get("product")
#     plan_name = stripe.Product.retrieve(product_id)['name']

#     # print(price_id, product_id, plan_name)

#     current_period_end = subscription_details["items"]["data"][0]["current_period_end"]
#     if current_period_end:
#         current_period_end = timezone.datetime.fromtimestamp(current_period_end)

#     subscription, created = Subscription.objects.get_or_create(
#         user=user_id,
#         defaults={
#             'stripe_subscription_id': subscription_id,
#             'stripe_customer_id': data.get("customer"),
#             'status': "active",
#             'plan_name': plan_name,
#             'price_id': price_id,
#             'product_id': product_id,
#             'current_period_start': timezone.now(),
#             'current_period_end': current_period_end,
#         }
#     )

#     if not created:
#         subscription.status = "active"
#         subscription.plan_name = plan_name
#         subscription.price_id = price_id
#         subscription.product_id = product_id
#         subscription.current_period_start = timezone.now()
#         subscription.current_period_end = current_period_end
#         subscription.save()

#     if created:
#         print(f"Created new subscription: {subscription_id}")
#     else:
#         print(f"Updated existing subscription: {subscription_id}")






def handle_checkout_session_completed(data):
    user_id = data.get("metadata", {}).get("user_id")
    subscription_id = data.get("subscription")

    # This fixes the metadata issue we discussed
    stripe.Subscription.modify(
        subscription_id,
        metadata={"user_id": user_id}
    )

    subscription_details = stripe.Subscription.retrieve(subscription_id)

    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)['name']

    # --- FIXED LINES START HERE ---
    current_period_end_ts = subscription_details.get("current_period_end")
    if current_period_end_ts:
        current_period_end = timezone.datetime.fromtimestamp(current_period_end_ts, tz=timezone.utc)
    else:
        current_period_end = None
    # --- FIXED LINES END HERE ---

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

    if created:
        print(f"Created new subscription: {subscription_id}")
    else:
        print(f"Updated existing subscription: {subscription_id}")










# def handle_subscription_updated(data):
#     subscription_id = data.get("id")
#     customer_email = data.get("customer_email")
#     status = data.get("status")
#     cancel_at_period_end = data.get("cancel_at_period_end")
    
#     subscription_details = stripe.Subscription.retrieve(subscription_id)
    
#     plan = subscription_details.get("plan", {})
#     price_id = plan.get("id")
#     product_id = plan.get("product")
#     plan_name = stripe.Product.retrieve(product_id)['name']  # Get the plan name from the product
#     print(plan_name)
    
#     current_period_end = subscription_details["items"]["data"][0]["current_period_end"]
#     if current_period_end:
#         current_period_end = timezone.datetime.fromtimestamp(current_period_end)

#     user_id = data.get("metadata", {}).get("user_id")


#     print(price_id, product_id, status, plan_name)

#     subscription, created = Subscription.objects.get_or_create(
#         stripe_subscription_id=subscription_id,
#         defaults={
#             'user': user_id,
#             'stripe_customer_id': data.get("customer"),
#             'status': status,
#             'plan_name': plan_name,
#             'price_id': price_id,
#             'product_id': product_id,
#             'current_period_start': timezone.now(), 
#             'current_period_end': current_period_end,
#         }
#     )

#     if not created:
#         subscription.status = status
#         subscription.plan_name = plan_name
#         subscription.price_id = price_id
#         subscription.product_id = product_id
#         subscription.cancel_at_period_end = cancel_at_period_end
#         subscription.current_period_start = timezone.now()  
#         subscription.current_period_end = current_period_end
#         subscription.save()

#     if created:
#         print(f"Created new subscription: {subscription_id}")
#     else:
#         print(f"Updated existing subscription: {subscription_id}")











def handle_subscription_updated(data):
    subscription_id = data.get("id")
    status = data.get("status")
    cancel_at_period_end = data.get("cancel_at_period_end")
    
    subscription_details = stripe.Subscription.retrieve(subscription_id)
    
    plan = subscription_details.get("plan", {})
    price_id = plan.get("id")
    product_id = plan.get("product")
    plan_name = stripe.Product.retrieve(product_id)['name']
    
    # --- FIXED LINES START HERE ---
    current_period_end_ts = subscription_details.get("current_period_end")
    if current_period_end_ts:
        current_period_end = timezone.datetime.fromtimestamp(current_period_end_ts, tz=timezone.utc)
    else:
        current_period_end = None
    # --- FIXED LINES END HERE ---

    user_id = data.get("metadata", {}).get("user_id")

    subscription, created = Subscription.objects.update_or_create(
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

    if plan_name.lower() == "brand":
        send_mail(
            subject="Subscription Activated",
            message=f"""
Dear user,\n
Your subscription has been updated to “BOTH”. Visit https://thesocialmarket.com to set up your new profile.\n
Best Regards,
            """,
            html_message=f"""
Dear user,<br>
Your subscription has been updated to “BOTH”.Click <a href="https://thesocialmarket.com">here</a> to set up your new profile.<br>
Best Regards,
            """,

        )
    if created:
        print(f"Created new subscription: {subscription_id}")
    else:
        print(f"Updated existing subscription: {subscription_id}")


def handle_subscription_deleted(data):
    subscription_id = data.get("id")
    customer_id = data.get("customer")



    subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id)
    if subscription.count() > 0:
        subscription = subscription.first()
        subscription.status = "canceled"
        subscription.save()



# def handle_payment_succeeded(data):
#     subscription_id = data.get("subscription")
#     customer_id = data.get("customer")

#     subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id)
#     if subscription.count() > 0:
#         subscription = subscription.first()

#         subscription.status = "active"
        
#         current_period_start = data.get("current_period_start")
#         current_period_end = data.get("current_period_end")
        
#         if current_period_start and current_period_end:
#             subscription.current_period_start = timezone.datetime.fromtimestamp(current_period_start)
#             subscription.current_period_end = timezone.datetime.fromtimestamp(current_period_end)
        
#         subscription.save()
#         subscription.status = "active"
#         subscription.save()


def handle_payment_succeeded(data):
    subscription_id = data.get("subscription")
    customer_id = data.get("customer")

    if not subscription_id:
        return

    # Retrieve full subscription from Stripe
    stripe_subscription = stripe.Subscription.retrieve(subscription_id)

    # Get price + product
    price = stripe_subscription["items"]["data"][0]["price"]
    product_id = price["product"]

    # Get plan name from product
    product = stripe.Product.retrieve(product_id)
    plan_name = product["name"]

    subscription = Subscription.objects.filter(
        stripe_subscription_id=subscription_id
    ).first()

    if subscription:
        subscription.status = "active"
        subscription.plan_name = plan_name
        subscription.price_id = price["id"]
        subscription.product_id = product_id

        current_period_start = stripe_subscription.get("current_period_start")
        current_period_end = stripe_subscription.get("current_period_end")

        if current_period_start and current_period_end:
            subscription.current_period_start = timezone.datetime.fromtimestamp(
                current_period_start, tz=timezone.utc
            )
            subscription.current_period_end = timezone.datetime.fromtimestamp(
                current_period_end, tz=timezone.utc
            )

        subscription.save()



def handle_payment_failed(data):
    subscription_id = data.get("subscription")
    customer_id = data.get("customer")  


   
    subscription = Subscription.objects.filter(stripe_subscription_id=subscription_id)
    if subscription.count() > 0:
        subscription = subscription.first()
        subscription.status = "past_due"
        subscription.save()




@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_user_subscription_information(request):
    user_id = int(request.token_payload.get('user_id'))
    # if Subscription.objects.filter(user=int(user_id)).count()>1:
    #     for i in Subscription.objects.filter(user=int(user_id)):
    #         i.delete()
    try:
        subs = Subscription.objects.filter(user=int(user_id))[0]
        serializer = SubscriptionSerializer(subs)

        return Response(
            generate_response(
            "success",
            200,
            serializer.data
        ), 200
        )
    except Exception as e:
        response = generate_response("failure", 400, {}, str(e))

        return Response(
            response, 400
        )
    


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_customer_portal(request):
    user_id = request.token_payload.get("user_id") 

    subscription = get_object_or_404(Subscription, user=user_id)
    stripe_customer_id = subscription.stripe_customer_id

    try:
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,  # Use the Stripe Customer ID
            configuration="bpc_1Sh2iiHgx3hXNxBFVOstkmaS",
            return_url="https://thesocialmarket.ai/home_dashboard",  
        )
        response = generate_response(
            "success",
            200,
            {"portal_url": session.url}
        )
        return Response(response, 200)

    except stripe.error.StripeError as e:
        return Response({
            "status": "failure",
            "message": str(e)
        }, status=400)




