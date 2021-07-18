from django.db import migrations
from django.core.exceptions import ObjectDoesNotExist
import warnings


def forwards(apps, schema_editor):
    if schema_editor.connection.alias != "default":
        return
    # Your migration code goes here
    Node = apps.get_model("sets", "Node")
    Tag = apps.get_model("tags", "Tag")
    ArchiveFile = apps.get_model("archive", "ArchiveFile")
    nodes = Node.objects.filter(tags__name__istartswith="node_media:")
    for node in nodes:
        tag = Tag.objects.get(name__istartswith="node_media:", node=node)
        media_ref = tag.name.split(":", maxsplit=1)[1]

        try:
            af = ArchiveFile.objects.get(original_filename__iendswith=media_ref)
        except ObjectDoesNotExist:
            warnings.warn(
                f"No file found from tag: {tag.name}, node {node.name} ({node.pk})"
            )
        else:
            node.representative_media = af.media_set.get()
            node.save()


class Migration(migrations.Migration):

    dependencies = [
        ("sets", "0003_node_representative_media"),
    ]

    operations = [migrations.RunPython(forwards)]
