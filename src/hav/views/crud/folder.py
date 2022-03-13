from django.contrib.auth.mixins import UserPassesTestMixin
from django.urls import reverse
from django.views.generic.edit import UpdateView

from hav.apps.sets.models import Node
from hav.apps.sets.permissions import can_edit_node


class FolderUpdateView(UserPassesTestMixin, UpdateView):
    model = Node
    fields = ["name", "description", "display_type"]
    pk_url_kwarg = "node_pk"
    template_name = "ui/crud/folder_edit.html"

    def test_func(self):
        return can_edit_node(self.request.user, self.get_object())

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        return ctx

    def get_success_url(self):
        collection = self.object.get_collection()
        return reverse(
            "hav:folder_view",
            kwargs={
                "collection_slug": collection.slug,
                "node_pk": self.object.pk,
            },
        )
