from django.conf.urls import url
from django.urls import path
from . import (
    IngestQueueView,
    IngestQueueDetailView,
    IngestOptionsView,
    IngestQueueIngestionView,
    IngestQueueModifier,
    SingleIngestView,
)

ingest_urls = [
    url(r"^options/$", IngestOptionsView.as_view()),
    url(r"^$", IngestQueueView.as_view(), name="ingest"),
    url(r"^single/$", SingleIngestView.as_view()),
    path(r"q/<uuid:pk>/", IngestQueueDetailView.as_view(), name="ingest_queue"),
    path(
        r"q/<uuid:pk>/ingest/",
        IngestQueueIngestionView.as_view(),
        name="ingest_queue_ingest",
    ),
    path(
        r"q/<uuid:pk>/modify/",
        IngestQueueModifier.as_view(),
        name="ingest_queue_modify",
    ),
]
