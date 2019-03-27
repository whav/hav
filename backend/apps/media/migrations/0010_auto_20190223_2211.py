# Generated by Django 2.1.7 on 2019-02-23 22:11

from django.db import migrations, models
import django.db.models.deletion

# this is copied from the old static types
# so it can be removed from the model in the future
struct = {
    'analogue': [
        'slide',
        'negative',
        'photo',
        'compact casette',
        'compact_audio_disc'
    ],
    'digital': [
        'photo',
        'video',
        'sound'
    ]
}


def iter_struct():
    for classification, items in struct.items():
        for i in items:
            yield('{}: {}'.format(classification, i))

media_types = list(enumerate(iter_struct(), 1))


def forwardMediaTypes(apps, schema_editor):
    if schema_editor.connection.alias != 'default':
        return

    MediaType = apps.get_model('media', 'MediaType')

    for i, full_name in media_types:
        type, name = full_name.split(':')
        name = name.strip()
        mt_type = 1 if type == 'analogue' else 2
        MediaType.objects.create(
            type=mt_type,
            name=name
        )

def forwardMedia(apps, schema_editor):
    if schema_editor.connection.alias != 'default':
        return
    Media = apps.get_model('media', 'Media')
    Media.objects.update(_original_media_type=models.F('original_media_type'))


class Migration(migrations.Migration):

    dependencies = [
        ('media', '0009_auto_20190223_1946'),
    ]

    operations = [
        migrations.CreateModel(
            name='MediaType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.IntegerField(choices=[(1, 'analog'), (2, 'digital')])),
                ('name', models.CharField(max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='media',
            name='_original_media_type',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='media.MediaType'),
        ),
        migrations.RunPython(forwardMediaTypes),
        migrations.RunPython(forwardMedia)

    ]