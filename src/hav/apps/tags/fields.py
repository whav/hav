from django import forms
from django.db import models

from .sources import TAG_LABEL_TO_SOURCE, TAGGING_SOURCE_CHOICES

available_sources = set(list(TAG_LABEL_TO_SOURCE.keys()))


def resolve_types(types=[]):
    from .models import Tag

    if not types:
        return Tag.objects.all()

    types = set(types)
    if not types.issubset(available_sources):
        difference = types.difference(available_sources)
        raise ValueError(
            f'The following tag sources are unknown: {", ".join(list(difference))}'
        )

    sources = list(types)
    return Tag.objects.filter(source__source__in=sources).order_by("pk")


class TagSourceChoiceField(models.CharField):
    description = "A CharField that restricts itself to the valid source keys."

    def __init__(self, *args, **kwargs):
        kwargs.update(
            {"max_length": 20, "choices": TAGGING_SOURCE_CHOICES, "db_index": True}
        )
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        # Ignore choice changes when generating migrations
        kwargs.pop("choices", None)
        return name, path, args, kwargs


class SingleTagSelectField(forms.ModelChoiceField):
    def __init__(self, types, **kwargs):
        qs = resolve_types(types)
        super().__init__(qs, **kwargs)


class MultipleTagSelectField(forms.ModelMultipleChoiceField):
    def __init__(self, *args, types=[], **kwargs):
        if types:
            kwargs.update({"limit_choices_to": resolve_types(types)})
        super().__init__(*args, **kwargs)
