import apps.webassets.models
import django.core.files.storage
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("archive", "0003_auto_20171008_0827"),
    ]

    operations = [
        migrations.CreateModel(
            name="WebAsset",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "file",
                    models.FileField(
                        storage=django.core.files.storage.FileSystemStorage(
                            location="/home/sean/src/hav/dist/webassets"
                        ),
                        upload_to=apps.webassets.models.upload_to,
                    ),
                ),
                ("mime_type", models.CharField(max_length=20)),
                (
                    "archivefile",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="archive.ArchiveFile",
                    ),
                ),
            ],
        ),
    ]
