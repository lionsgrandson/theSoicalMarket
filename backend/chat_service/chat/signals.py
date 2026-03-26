from django.dispatch import receiver
from django.db.models.signals import post_save
import httpx

from .models import ChatMessage

# @receiver(post_save, sender=ChatMessage)
# def handle_message_save_create(sender, instance, created, **kwargs):
#     if created:
