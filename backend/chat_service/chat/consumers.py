import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage
from . import utils
from asgiref.sync import sync_to_async
import httpx


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        self.user_id = self.scope.get('user_id')

        if not self.user_id:
            # Reject connection if no token or invalid token
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            file = text_data_json.get('file')
            print(f"File got: {file}")

            if not message and not file:
                return 

            # 2. Save to Database (Async wrapper required)
            # await self.save_message(self.room_id, self.user_id, message, file)
            is_first, msg = await self.save_message_db(
                self.room_id,
                self.user_id,
                message,
                file
            )

            if is_first:
                async with httpx.AsyncClient() as client:
                    # await client.post(
                    #     "http://user_service:8000/create_log/",
                    #     json={
                    #         "type_alias": "FIRST_MESSAGE",
                    #         "sender_id": self.user_id,
                    #         "receiver_id": self.user_id
                    #     },
                    #     timeout=5
                    # )
                    await client.post(
                        "http://user_service:8000/create_log/",
                        headers={"Host": "localhost", "services-shared-secret": os.environ['SERVICES_SHARED_SECRET']},
                        json={
                            "type_alias": "FIRST_MESSAGE",
                            "sender_id": self.user_id,
                            "receiver_id": str(self.room_id).replace(str(self.user_id), "").replace("_", ""),
                            "msg": message
                        }
                    )


            # await sync_to_async(Notification.objects.create)(user_id=user_id, payload=message_dict)

            print("<<<<< It is good >>>>")

            # 3. Broadcast with sender ID
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message_data': {
                        'message': message if message else "",
                        'file': file if file else "",
                        'sender_id': self.user_id
                    }
                }
            )
            # await sync_to_async(Notification.objects.create)(user_id=user_id, payload=message_dict)
        except json.JSONDecodeError:
            pass
        except Exception as e:
            print(f"Error: {e}")

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message_data']))

    # Helper function to save to DB
    # @database_sync_to_async
    # def save_message(self, room_id, sender_id, message, file):
    #     if ChatMessage.objects.filter(room_id=room_id).count() == 0:
    #         httpx.post(
    #             "http://user_service:8000/create_log/",
    #             headers={"Host": "localhost"},
    #             json={
    #                 "type_alias": "FIRST_MESSAGE",
    #                 "sender_id": sender_id,
    #                 "receiver_id": self.user_id
    #             }
    #         )
    #         # pass
    #     return ChatMessage.objects.create(
    #         room_id=room_id,
    #         sender_id=sender_id,
    #         message=message,
    #         file=file
    #     )
    @database_sync_to_async
    def save_message_db(self, room_id, sender_id, message, file):
        is_first = not ChatMessage.objects.filter(room_id=room_id).exists()

        msg = ChatMessage.objects.create(
            room_id=room_id,
            sender_id=sender_id,
            message=message,
            file=file
        )

        return is_first, msg


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # self.room_id = self.scope['url_route']['kwargs']['room_id']

        self.user_id = self.scope.get('user_id')
        self.room_group_name = f'noti_{self.user_id}'
        


        if not self.user_id:
            # Reject connection if no token or invalid token
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # async def receive(self, text_data=None, bytes_data=None):
    #     if not text_data:
    #         return

    #     try:
    #         text_data_json = json.loads(text_data)
    #         message = text_data_json.get('message')
    #         file = text_data_json.get('file')
    #         print(f"File got: {file}")

    #         if not message and not file:
    #             return 

    #         # 2. Save to Database (Async wrapper required)
    #         await self.save_message(self.room_id, self.user_id, message, file)

    #         # 3. Broadcast with sender ID
    #         await self.channel_layer.group_send(
    #             self.room_group_name,
    #             {
    #                 'type': 'chat_message',
    #                 'message_data': {
    #                     'message': message if message else "",
    #                     'file': file if file else "",
    #                     'sender_id': self.user_id
    #                 }
    #             }
    #         )
    #     except json.JSONDecodeError:
    #         pass
    #     except Exception as e:
    #         print(f"Error: {e}")

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message_data']))

    # Helper function to save to DB
    # @database_sync_to_async
    # def save_message(self, room_id, sender_id, message, file):
    #     return ChatMessage.objects.create(
    #         room_id=room_id,
    #         sender_id=sender_id,
    #         message=message,
    #         file=file
    #     )
