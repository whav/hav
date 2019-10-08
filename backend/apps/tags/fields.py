from django import forms
from .models import Tag, CollectionTag, ManagedTag
from .sources import TAG_LABEL_TO_SOURCE

available_sources = set(list(TAG_LABEL_TO_SOURCE.keys()))


def resolve_types(types=[]):
    if not types:
        return Tag.objects.select_subclasses()

    types = set(types)
    if not types.issubset(available_sources):
        difference = types.difference(available_sources)
        raise ValueError(f'The following tag sources are unknown: {", ".join(list(difference))}')

    sources = list(types)
    return Tag.objects.\
        filter(managedtag__source__in=sources).\
        order_by('pk').select_subclasses(ManagedTag)


class SingleTagSelectField(forms.ModelChoiceField):

    def __init__(self,  types, **kwargs):
        qs = resolve_types(types)
        super().__init__(qs, **kwargs)


class MultipleTagSelectField(forms.ModelMultipleChoiceField):

    def __init__(self, *args, types=[], **kwargs):
        if types:
            kwargs.update({'limit_choices_to': resolve_types(types)})
        super().__init__(*args, **kwargs)
