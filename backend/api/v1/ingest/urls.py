from django.conf.urls import url, include
from django.urls import path
from . import PrepareIngestView, IngestQueueView, IngestQueueDetailView, IngestOptionsView

ingest_urls = [
    url(r'^data/$', PrepareIngestView.as_view(), name='prepare_ingest'),
    url(r'^options/$', IngestOptionsView.as_view()),
    url(r'^$', IngestQueueView.as_view(), name='ingest'),
    path(r'<uuid:pk>/', IngestQueueDetailView.as_view())
]