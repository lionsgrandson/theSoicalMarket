from datetime import datetime



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
def send_notification_to_user(user_id, message_dict):
    # Determine the user related to this instance
    # assert isinstance(user, CustomUser)
 
    # Get the channel layer
    channel_layer = get_channel_layer()
    
    print("DEBUG>>>>>")
    print(message_dict.__class__)
    print(message_dict)
    print("<<<")
    print(json.dumps(message_dict))
    # Send notification to the specific user's WebSocket group
    async_to_sync(channel_layer.group_send)(
        f'noti_{user_id}',  # Group name
        {
            'type': 'chat_message',
            'message_data': {
                "message": json.dumps(message_dict),
            },
        }
    )
 