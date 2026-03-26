import os
import django

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

# django.setup()


# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from celery_s.routing import websocket_urlpatterns
# from celery_s.middleware import JWTAuthMiddleware 

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": JWTAuthMiddleware(
#         URLRouter(websocket_urlpatterns)
#     ),
# })