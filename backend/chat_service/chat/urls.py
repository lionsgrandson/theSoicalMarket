from django.urls import path
from . import views



urlpatterns = [
    path('get_or_create_room/', views.get_or_create_room, name='get_or_create_room'),
    path('get_my_rooms/', views.get_my_rooms, name='get_my_rooms'),
    path('get_room_history/<str:room_id>/', views.get_room_history, name='get_room_history'),
    path('notification/<str:user_id>/', views.send_mock_notification, name='mock_notification'),

    path('get_unread_noti/', views.get_unseen_Notification, name='unseen-noti'),
    path('noti_seen_all/', views.noti_all_read, name='noti-seen-all'),
    path('unseen_notification_counts/', views.get_unseen_notification_counts),
]
