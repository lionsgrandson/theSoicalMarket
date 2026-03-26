from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
import datetime
import os

from .tasks import send_email_task, task_send_email_if_profile_not_complete

@api_view(['POST'])
def send_mail(request):
    services_shared_secret = request.headers.get('services-shared-secret')
    if not services_shared_secret or services_shared_secret != os.environ.get('SERVICES_SHARED_SECRET'):
        print("Unauthorized access attempt to send_mail")
        return Response({"error": "Unauthorized"}, status=401)
    email = request.data['email']
    message = request.data['message']
    delay = request.data.get('delay', 0)
    send_email_task.apply_async(
        args=(
            email, message, delay
        ),
        eta=datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=delay)
    )

    print("DEBUGING ....")
    return Response({
        "success": True
    })


@api_view(['POST'])
def send_email_if_profile_not_complete(request, pk):
    message = request.data['message']
    print("task sending")

    
    services_shared_secret = request.headers.get('services-shared-secret')
    print("DEBUG ...>>>>>   ")
    print(request.headers)
    # print(services-shared-secret)
    print(os.environ.get('SERVICES_SHARED_SECRET'))
    if not services_shared_secret or services_shared_secret != os.environ.get('SERVICES_SHARED_SECRET'):
        print("Unauthorized access attempt to send_email_if_profile_not_complete with pk:", pk)
        return Response({"error": "Unauthorized"}, status=401)
    task_send_email_if_profile_not_complete.apply_async(
        args=(
            pk, message
        ),
        eta=datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=24*60*60)  # 24 hours in seconds
    )
    print("tas sent")

    print("DEBUGING ....")
    return Response({
        "success": True
    })