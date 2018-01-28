from django.conf.urls import url
from django.urls import path
from . import IngestQueueView, IngestQueueDetailView, IngestOptionsView, IngestQueueIngestionView

ingest_urls = [
    url(r'^options/$', IngestOptionsView.as_view()),
    url(r'^$', IngestQueueView.as_view(), name='ingest'),
    path(r'<uuid:pk>/', IngestQueueDetailView.as_view()),
    path(r'<uuid:pk>/ingest/', IngestQueueIngestionView.as_view())
]