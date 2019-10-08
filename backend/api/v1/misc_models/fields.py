from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from apps.tags.models import Tag, create_tag_from_source_key


class CreatableTagField(serializers.PrimaryKeyRelatedField):

    def to_internal_value(self, value):
        try:
            Tag.objects.get(pk=value)
        except Tag.DoesNotExist:
            create_tag_from_source_key(value)
        return value


