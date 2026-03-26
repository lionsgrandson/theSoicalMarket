from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .permissions import IsJWTAuthenticated

from .utils import generate_response, fetch_user_info

from rest_framework import status
from django.db.models import Q
from .models import ChatMessage, Notification
import os

from .serializers import NotificationSerializer


def _is_internal_request_authorized(request) -> bool:
    shared_secret = request.headers.get("services-shared-secret")
    if shared_secret and shared_secret == os.environ.get("SERVICES_SHARED_SECRET"):
        return True

    notification_secret = request.headers.get("noti_secret_key")
    return bool(notification_secret and notification_secret == os.environ.get("NOTI_SECRET_KEY"))

@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def get_or_create_room(request):
    # commented by RONI vai
    my_id = str(request.token_payload.get('user_id'))
    
    # # added by RONI vai
    # my_id = request.user.id
    
    target_id = str(request.data.get('target_user_id'))

    if not target_id:
        response = generate_response(
            "failure", 400, {}, "Target User ID is required"
        )
        return Response(response, status=400)

    if my_id == target_id:
        response = generate_response(
            "failure", 400, {}, "You cannot chat with yourself"
        )
        return Response(response, 400)

    try:
        sorted_ids = sorted([int(my_id), int(target_id)])
    except ValueError:
        sorted_ids = sorted([my_id, target_id])

    room_id = f"{sorted_ids[0]}_{sorted_ids[1]}"


    response = generate_response(
        "success", 200, {"room_id": room_id}
    )
    return Response(response, status=200)





@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_my_rooms(request):
    user_id = str(request.token_payload.get('user_id'))
    auth_header = request.headers.get('Authorization')
    
    rooms_query = ChatMessage.objects.filter(
        Q(sender_id=user_id) | 
        Q(room_id__startswith=f"{user_id}_") | 
        Q(room_id__endswith=f"_{user_id}")
    ).values_list('room_id', flat=True).distinct()

    results = []


    for room_id in rooms_query:
        last_msg = ChatMessage.objects.filter(room_id=room_id).order_by('-timestamp').first()
        
        if last_msg:
            ids = room_id.split('_')
            other_user_id = ids[1] if ids[0] == user_id else ids[0]

            name, profile_picture = fetch_user_info(other_user_id,auth_header )
            print(name, profile_picture)
            print("OTHER USER ID:", name)

            results.append({
                "room_id": room_id,
                "other_user_id": other_user_id, 
                "last_message": last_msg.message,
                "seen": last_msg.seen,
                "name": name,
                "profile_picture": profile_picture,
                "timestamp": last_msg.timestamp,
            })
    results.sort(key=lambda x: x['timestamp'], reverse=True)


    response = generate_response(
        "success", 200, results
    )
    return Response(response, status=200)



@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_room_history(request, room_id):
    user_id = str(request.token_payload.get('user_id'))
    
    ids = room_id.split('_')
    if user_id not in ids:
        response = generate_response(
            "failure", 400, {}, "You are not a participant in this room"
        )
        return Response(response, status=403)

    messages = ChatMessage.objects.filter(room_id=room_id).order_by('-timestamp')
    
    data = [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "is_me": msg.sender_id == user_id, 
            "message": msg.message,
            "file": msg.file,
            "timestamp": msg.timestamp,
            "seen": msg.seen,
        }
        for msg in messages
    ]

    ChatMessage.objects.filter(room_id=room_id).update(seen=True)
    response = generate_response(
        "success", 200, data
    )

    return Response(response, status=200)

from .utils import send_notification_to_user
@api_view(['POST'])
def send_mock_notification(request, user_id):
    if not _is_internal_request_authorized(request):
        return Response({
            "success": False,
            "message": "Unauthorized"
        }, status=401)
    message_dict = request.data['message_dict']
    print("CALLED NOTI <<<<<<<")
    print("CALLED NOTI <<<<<<<")
    print("CALLED NOTI <<<<<<<")
    send_notification_to_user(user_id, message_dict)
    # n = Notification()
    # n.user_id = user_id
    # n.payload = message_dict
    # n.save()
    return Response({
        "success": True
    })


@api_view(['get'])
@permission_classes([IsJWTAuthenticated])
def get_unseen_Notification(request):
    my_id = str(request.token_payload.get('user_id'))
    print(Notification.objects.all())
    notifications = Notification.objects.filter(user_id=my_id, seen=False)

    print(notifications.count())
    # notifications.update(seen=True)
    # return Response({
    #     "unseen_notifications": {
    #         "payload": notification.payload,
    #         "id": notification.id,
    #     } for notification in notifications
    # })

    serializer = NotificationSerializer(notifications, many=True)
    response = generate_response("success", 200, serializer.data)
    return Response(
        response, status=200
    )

@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def noti_all_read(request):
    my_id = str(request.token_payload.get('user_id'))
    Notification.objects.filter(user_id=my_id).update(seen=True)
    return Response({
        "seen": True
    })


@api_view(['GET'])
@permission_classes([IsJWTAuthenticated])
def get_unread_message(request):
    # FIX: was a copy-paste of noti_all_read — marked everything read and returned {"seen": True}
    # Now returns actual unread message counts per room
    from django.db.models import Q, Count
    my_id = str(request.token_payload.get('user_id'))

    rooms = ChatMessage.objects.filter(
        Q(room_id__startswith=f"{my_id}_") |
        Q(room_id__endswith=f"_{my_id}")
    ).values_list('room_id', flat=True).distinct()

    unread_rooms = []
    for room_id in rooms:
        count = ChatMessage.objects.filter(
            room_id=room_id,
            seen=False,
        ).exclude(sender_id=my_id).count()
        if count > 0:
            unread_rooms.append({"room_id": room_id, "unread_count": count})

    total = sum(r["unread_count"] for r in unread_rooms)
    response = generate_response("success", 200, {
        "total_unread": total,
        "rooms": unread_rooms,
    })
    return Response(response, status=200)


@api_view(['GET'])
def get_unseen_notification_counts(request):
    """
    Internal endpoint for unread-notification reminder emails.
    Returns unseen notification counts older than 24 hours grouped by user.
    """
    from django.utils import timezone
    from datetime import timedelta
    from django.db.models import Count

    if any(field.name == 'timestamp' for field in Notification._meta.fields):
        cutoff = timezone.now() - timedelta(hours=24)
        queryset = Notification.objects.filter(seen=False, timestamp__lt=cutoff)
    else:
        queryset = Notification.objects.filter(seen=False)

    counts = queryset.values('user_id').annotate(count=Count('id')).order_by('-count')

    data = [{'user_id': row['user_id'], 'count': row['count']} for row in counts]
    return Response(generate_response("success", 200, data), 200)
