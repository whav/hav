# Generated by Django 3.2.13 on 2022-05-03 16:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("hav_collections", "0004_alter_collection_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="collection",
            name="hide_browser_at_root_level",
            field=models.BooleanField(default=False),
        ),
    ]
