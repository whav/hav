from django.db import models
from django.contrib.postgres.fields import DateTimeRangeField, ArrayField
from django.conf import settings
from django.utils.functional import cached_property
from model_utils.models import TimeStampedModel
from apps.sets.models import Node
from apps.hav_collections.models import Collection
from apps.tags.models import Tag


class MediaType(models.Model):
    TYPE_CHOICES = [(1, "analog"), (2, "digital")]

    ANALOG = TYPE_CHOICES[0][0]
    DIGITAL = TYPE_CHOICES[1][0]

    type = models.IntegerField(choices=TYPE_CHOICES)
    name = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.get_type_display()}/{self.name}"

    class Meta:
        unique_together = (("type", "name"),)


class MediaCreator(TimeStampedModel):

    name = models.CharField(max_length=200)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        editable=False,
        related_name="+",
        related_query_name="+",
    )
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        editable=False,
        related_name="+",
        related_query_name="+",
    )

    def __str__(self):

        if self.display_name:
            return self.display_name

        return "{0}{1}".format(
            self.last_name, ", {0}".format(self.first_name) if self.first_name else ""
        )


class MediaCreatorRole(models.Model):

    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class CreatorBase(models.Model):
    creator = models.ForeignKey(MediaCreator, on_delete=models.CASCADE)
    role = models.ForeignKey(MediaCreatorRole, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True


class MediaToCreator(CreatorBase):

    media = models.ForeignKey("Media", on_delete=models.CASCADE)

    class Meta:
        unique_together = [("creator", "role", "media")]


class License(models.Model):
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=40, unique=True)
    href = models.URLField(blank=True)

    def __str__(self):
        return self.short_name


class MediaManager(models.Manager):
    def create_media(self, creators=[], **kwargs):
        media = self.create(**kwargs)
        for c in creators:
            MediaToCreator.objects.create(creator=c, media=media)
        return media


class Media(models.Model):

    title = models.CharField("title", max_length=255, blank=True)
    description = models.TextField("description", blank=True)

    collection = models.ForeignKey(
        Collection, null=True, blank=False, on_delete=models.PROTECT
    )

    creators = models.ManyToManyField(
        MediaCreator, through=MediaToCreator, verbose_name="creators"
    )

    creation_date = DateTimeRangeField(null=True, blank=True)

    license = models.ForeignKey(
        License, null=True, blank=True, on_delete=models.SET_NULL
    )

    original_media_type = models.ForeignKey(MediaType, on_delete=models.PROTECT)

    # these fields are mainly used for automatic imports
    original_media_description = models.TextField(blank=True)
    original_media_identifier = models.CharField(blank=True, max_length=200)

    set = models.ForeignKey(Node, on_delete=models.PROTECT)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_media"
    )

    modified_at = models.DateTimeField(auto_now=True, null=True)
    modified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.PROTECT,
        related_name="modified_media",
    )

    files = models.ManyToManyField("archive.ArchiveFile", blank=False)
    attachments = models.ManyToManyField(
        "archive.AttachmentFile", blank=True, related_name="is_attachment_for"
    )

    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return "Media ID {}".format(self.pk)

    @cached_property
    def primary_file(self):
        try:
            return self.files.all()[0]
        except IndexError:
            return None

    objects = MediaManager()

    class Meta:
        ordering = ("created_at",)
