import jwt
from django.conf import settings
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser



@database_sync_to_async
def get_user(token):
    try:
        payload = jwt.decode(
            token,
            settings.SIMPLE_JWT['SIGNING_KEY'],
            algorithms=[settings.SIMPLE_JWT.get('ALGORITHM', 'HS256')]
        )
        return payload # Returning the dict payload (e.g. {'user_id': 1, ...})
    except:
        return None

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # 1. Parse the query string to get the token
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = dict(qc.split("=") for qc in query_string.split("&") if "=" in qc)
        token = query_params.get("token")

        # 2. Validate Token
        if token:
            user_payload = await get_user(token)
            if user_payload:
                scope['user_id'] = user_payload.get('user_id') # Adjust key based on your JWT structure
                scope['user_payload'] = user_payload
            else:
                scope['user_id'] = None
        else:
            scope['user_id'] = None

        return await self.app(scope, receive, send)