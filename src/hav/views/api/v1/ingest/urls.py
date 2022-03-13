from django.urls import path

from . import (
    IngestOptionsView,
    IngestQueueDetailView,
    IngestQueueIngestionView,
    IngestQueueModifier,
    IngestQueueView,
    SingleIngestView,
)

ingest_urls = [
    path("options/", IngestOptionsView.as_view()),
    path("", IngestQueueView.as_view(), name="ingest"),
    path("single/", SingleIngestView.as_view()),
    path("q/<uuid:pk>/", IngestQueueDetailView.as_view(), name="ingest_queue"),
    path(
        "q/<uuid:pk>/ingest/",
        IngestQueueIngestionView.as_view(),
        name="ingest_queue_ingest",
    ),
    path(
        "q/<uuid:pk>/modify/",
        IngestQueueModifier.as_view(),
        name="ingest_queue_modify",
    ),
]
