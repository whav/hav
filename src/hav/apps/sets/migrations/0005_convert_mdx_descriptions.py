"""Convert node descriptions from MDX to the Markdown syntax.

Descriptions that are already Markdown are left untouched. The conversion can't
be reversed; unapplying this migration keeps the converted descriptions.
"""

from django.db import migrations

from hav.apps.theme.mdx import convert, is_changed


def convert_descriptions(apps, schema_editor):
    Node = apps.get_model("sets", "Node")
    Media = apps.get_model("media", "Media")

    def media_folder(media_id):
        return (
            Media.objects.filter(pk=media_id).values_list("set_id", flat=True).first()
        )

    def node_name(node_id):
        return Node.objects.filter(pk=node_id).values_list("name", flat=True).first()

    for node in Node.objects.exclude(description=""):
        converted, warnings = convert(node.description, media_folder, node_name)
        for warning in warnings:
            print(f"\n  node {node.pk}: {warning}", end="")
        if is_changed(node.description, converted):
            node.description = converted
            node.save(update_fields=["description"])


class Migration(migrations.Migration):

    dependencies = [
        ("sets", "0004_fill_up_representative_media"),
        ("media", "0006_alter_media_managers"),
    ]

    operations = [migrations.RunPython(convert_descriptions, migrations.RunPython.noop)]
