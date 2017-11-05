from __future__ import absolute_import, unicode_literals
from hav.celery import app


from .operations.create import archive_file


@app.task
def archive(serializer_data):
    from api.v1.ingest.serializers import IngestSerializer
    serializer = IngestSerializer(data=serializer_data)
    print(serializer.is_valid(raise_exception=False))
    print(serializer_data)


