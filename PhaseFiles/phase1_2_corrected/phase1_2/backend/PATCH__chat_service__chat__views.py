"""
PATCH FILE: chat_service/chat/views.py
=======================================
One surgical replacement — get_unread_message was a copy-paste of noti_all_read.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: get_unread_message was marking notifications read and returning {"seen": True}
# ─────────────────────────────────────────────────────────────────────────────

FIND_1 = """@api_view(['POST'])
@permission_classes([IsJWTAuthenticated])
def get_unread_message(request):
    my_id = str(request.token_payload.get('user_id'))
    Notification.objects.filter(user_id=my_id).update(seen=True)
    return Response({
        "seen": True
    })"""

REPLACE_1 = """@api_view(['GET'])
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
    return Response(response, status=200)"""
