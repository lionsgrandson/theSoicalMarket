from django.urls import path
from . import views

urlpatterns = [
    path('get_subscription_plans/', views.get_subscription_plans, name='get_subscription_plans'),
    path('create_checkout_session/', views.create_checkout_session, name='create_checkout_session'),
    path('webhook/', views.stripe_webhook, name='stripe_webhook'),
    path('get_user_subscription_information/', views.get_user_subscription_information, name='get_user_subscription_information'),
    path('customer-portal/', views.get_customer_portal, name='get_customer_portal')
]