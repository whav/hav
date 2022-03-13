from django import forms

from hav.apps.sets.models import Node


class SearchForm(forms.Form):
    q = forms.CharField(label="query", required=False)
    node = forms.ModelChoiceField(
        Node.objects.all(), required=False, widget=forms.HiddenInput
    )
    filters = forms.CharField(required=False, widget=forms.HiddenInput)
