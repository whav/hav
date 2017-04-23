from rest_framework import serializers
from incoming.models import FileIngestSelection

class FileIngestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = FileIngestSelection
        fields = [
            'pk',
            'description',
            'source_references'
        ]