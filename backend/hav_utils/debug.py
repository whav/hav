from django.conf import settings


def show_toolbar(request):
    if settings.DEBUG and request.accepts("text/html"):
        return True
    return False
