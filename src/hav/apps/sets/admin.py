import pathlib
import tempfile
import zipfile

from django.contrib import admin
from django.db.models.functions import Length
from django.http import FileResponse
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory

from .models import Node


@admin.action(description="Export selected node descriptions as mdx")
def export_descriptions(modeladmin, request, queryset):
    from .management.commands.export_mdx import export_descriptions

    with tempfile.TemporaryDirectory() as temp_dir, tempfile.NamedTemporaryFile(
        suffix=".zip", delete=False
    ) as zip_file:
        output_path = pathlib.Path(temp_dir)
        exported_paths = export_descriptions(output_path, queryset)
        zf = zipfile.ZipFile(zip_file, "w")
        for p in exported_paths:
            zf.write(p, arcname=pathlib.Path(p).name)

        zf.close()

        content = open(zip_file.name, "rb")
        return FileResponse(content, as_attachment=True, filename="mdx_export.zip")


class HasDescriptionFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = "has description"

    # Parameter for the filter that will be used in the URL query.
    parameter_name = "desc_length"

    def lookups(self, request, model_admin):
        return [("1", "With description text"), ("0", "Without description text")]

    def queryset(self, request, queryset):
        if self.value() == "0":
            queryset = queryset.filter(description_length=0)
        elif self.value() == "1":
            queryset = queryset.exclude(description_length=0)

        return queryset


class NodeAdmin(TreeAdmin):
    list_display = ["name", "description_length"]
    list_filter = [HasDescriptionFilter]
    actions = [export_descriptions]
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
    search_fields = [
        "name",
    ]

    def description_length(self, node):
        return node.description_length

    def get_queryset(self, request):
        return Node.objects.annotate(description_length=Length("description"))


admin.site.register(Node, NodeAdmin)
