import datetime
import os

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .tasks import send_email_task, task_send_email_if_profile_not_complete


def _authorized(request) -> bool:
    shared_secret = request.headers.get("services-shared-secret")
    return bool(shared_secret and shared_secret == os.environ.get("SERVICES_SHARED_SECRET"))


@api_view(["POST"])
def send_mail(request):
    if not _authorized(request):
        return Response({"error": "Unauthorized"}, status=401)

    email = request.data.get("email")
    template_key = request.data.get("template_key", "PROFILE_INCOMPLETE")
    context = request.data.get("context", {})
    delay = int(request.data.get("delay", 0))

    send_email_task.apply_async(
        args=(email, template_key, context),
        eta=datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=delay),
    )
    return Response({"success": True})


@api_view(["POST"])
def send_email_if_profile_not_complete(request, pk):
    if not _authorized(request):
        return Response({"error": "Unauthorized"}, status=401)

    delay_seconds = int(request.data.get("delay_seconds", 60))
    task_send_email_if_profile_not_complete.apply_async(
        args=(pk,),
        eta=datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=delay_seconds),
    )
    return Response({"success": True})
