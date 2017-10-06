from mimetypes import guess_type

from treebeard.mp_tree import MP_Node
from django.db import models
from django.utils.functional import cached_property

class ImageCollection(MP_Node):

    name = models.CharField(max_length=500)
    images = models.ManyToManyField(
        'Media',
        through='MediaOrdering'
    )

    def __str__(self):
        return self.name if self.name else 'IC %d' % self.pk

    class Meta:
        managed = False
        db_table = 'imagecollections_imagecollection'


class Media(models.Model):

    id = models.AutoField(primary_key=True, db_column='media_id')
    signature = models.CharField(unique=True, max_length=100, db_column='media_signature')

    @cached_property
    def basefile(self):
        return self.basefile_set.get()

    @cached_property
    def localfile(self):
        return self.basefile.localfile

    class Meta:
        managed = False
        db_table = 'media'


class MediaOrdering(models.Model):
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    collection = models.ForeignKey(ImageCollection, on_delete=models.CASCADE)

    date_added = models.DateField(auto_now_add=True)
    order = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['order', 'media__id']
        db_table = 'imagecollections_mediaordering'


class Basefile(models.Model):
    media = models.ForeignKey(Media, on_delete=models.CASCADE)
    primary_storage = models.CharField(max_length=10)
    size = models.IntegerField(blank=True, null=True)
    archived = models.DateTimeField(blank=True, null=True)
    mime_type = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'file_backends_basefile'


class Localfile(models.Model):
    basefile = models.OneToOneField(Basefile, on_delete=models.CASCADE)
    path = models.CharField(max_length=300, blank=True)
    deleted = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'file_backends_localfile'


class WebImage(models.Model):

    original_image = models.CharField(max_length=200)
    media = models.OneToOneField(Media, null=True, related_name='webimage', blank=True, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'webimage_webimage'
