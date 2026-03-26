from django.db import models

class ChatMessage(models.Model):
    room_id = models.CharField(max_length=255)
    sender_id = models.CharField(max_length=255) 
    message = models.TextField(blank=True, null=True)
    file = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    seen = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender_id}: {self.message[:20]}"
    

class Notification(models.Model):
    user_id = models.IntegerField(blank=True, null=True)
    payload = models.JSONField(default=dict)
    seen = models.BooleanField(default=False)