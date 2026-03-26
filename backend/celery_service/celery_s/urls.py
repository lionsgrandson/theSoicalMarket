from django.urls import path
from . import views



urlpatterns = [
    path("<str:email>/send_mail/", views.send_mail),
    path("send_email_if_profile_not_complete/<int:pk>/", views.send_email_if_profile_not_complete),
]