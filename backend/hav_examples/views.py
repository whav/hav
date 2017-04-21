from django.views.generic import ListView
from .models import Media

class MediaList(ListView):
    model = Media