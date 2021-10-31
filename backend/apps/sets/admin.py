from django.contrib import admin
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory

from .models import Node


class NodeAdmin(TreeAdmin):
    fields = [
        "name",
        "description",
        "display_type",
        "_position",
        "_ref_node_id",
        "tags",
        "representative_media",
    ]
    raw_id_fields = [
        "representative_media",
    ]
    filter_horizontal = ["tags"]
    form = movenodeform_factory(Node)


admin.site.register(Node, NodeAdmin)
