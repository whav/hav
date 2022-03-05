from rest_framework import serializers
from hav.apps.tags.models import Tag


class CreatableTagField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, value):
        return Tag.objects.get(pk=value)
