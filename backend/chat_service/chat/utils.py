from datetime import datetime
import requests


def generate_response(status="undefined", code=0, data={}, error={}):
    sample_response = {
        "status": status,
        "code": code,
        "data": data,
        "error": error,
        "meta": {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    }

    return sample_response


def fetch_user_info(user_id, auth_token):
    url = f"http://user_service:8000/get_user_info_by_id/{user_id}/"

    headers = {
        "Authorization": auth_token,
        "Host": "localhost" 
    }

    try:
        response = requests.get(url, headers=headers,timeout=3)
        if response.status_code == 200:
            data = response.json()
            print("DEBUGING,,......", data['data']['user']['first_name'], data['data']['influencer_profile'])
            if data['data']['influencer_profile'] is None and data['data']['brand_profile'] is None:
                profile_picture = None
            elif data['data']['influencer_profile'] is not None:
                profile_picture = data['data']['influencer_profile']['profile_picture']
            else:
                profile_picture = data['data']['brand_profile']['logo']
            return data['data']['user']['first_name'] + " " + data['data']['user']['last_name'], profile_picture
    except Exception as e:
        print(f"Error fetching user {user_id}: {e}")
    
    return  "Unknown", None

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json


                # {
                #     'type': 'chat_message',
                #     'message_data': {
                #         'message': message if message else "",
                #         'file': file if file else "",
                #         'sender_id': self.user_id
                #     }
                # }

from .models import Notification
def send_notification_to_user(user_id, message_dict):
    # Determine the user related to this instance
    # assert isinstance(user, CustomUser)
 
    # Get the channel layer
    channel_layer = get_channel_layer()
 
    # Send notification to the specific user's WebSocket group
    Notification.objects.create(user_id=user_id, payload=message_dict)
    async_to_sync(channel_layer.group_send)(
        f'noti_{user_id}',  # Group name
        {
            'type': 'chat_message',
            'message_data': {
                "message": json.dumps(message_dict),
            },
        }
    )
 
        # channel_layer.group_send(
        #     f'notifications_{user.id}',  # Group name
        #     {
        #         'type': 'send_notification',
        #         'notification': data,
        #     }
        # )