from decimal import Decimal
from django.db import models
from django.contrib.postgres.fields import DateTimeRangeField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.functional import cached_property
from model_utils.models import TimeStampedModel
from apps.sets.models import Node
from apps.hav_collections.models import Collection
from apps.tags.models import Tag
from apps.tags.utils import filter_by_prefix, filter_location_tags
from apps.accounts.models import User
from datetime import date


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

    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        editable=False,
        related_name="+",
        related_query_name="+",
    )
    modified_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        null=True,
        editable=False,
        related_name="+",
        related_query_name="+",
    )

    @property
    def name(self):
        return "{0}{1}".format(
            self.last_name, ", {0}".format(self.first_name) if self.first_name else ""
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

    logo = models.ImageField(upload_to="license_logos", blank=True)

    def __str__(self):
        return self.short_name


class MediaManager(models.Manager):
    def create_media(self, creators=[], **kwargs):
        media = self.create(**kwargs)
        for c in creators:
            MediaToCreator.objects.create(creator=c, media=media)
        return media

    def publicly_available(self):
        return self.exclude(is_private=True).exclude(
            models.Q(embargo_end_date__isnull=False)
            | models.Q(embargo_end_date__gte=date.today())
        )


class MediaPreviewManager(models.Manager):

    image_preview_attr = "_primary_image_webasset"

    def with_image_previews(self):
        from apps.webassets.models import WebAsset

        qs = WebAsset.objects.filter(mime_type__istartswith="image/")
        prefetch = models.Prefetch(
            "files__webasset_set", queryset=qs, to_attr=self.image_preview_attr
        )
        return self.prefetch_related(prefetch)


class Media(models.Model):

    short_code = models.SlugField(
        null=True, default=None, unique=True, blank=True, max_length=6
    )
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

    embargo_end_date = models.DateField(null=True, blank=True)
    is_private = models.BooleanField(default=False)

    coords_lat = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal(-90)),
            MaxValueValidator(Decimal(90)),
        ],
        null=True,
        blank=True,
    )
    coords_lon = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(Decimal(-180)),
            MaxValueValidator(Decimal(180)),
        ],
        null=True,
        blank=True,
    )

    set = models.ForeignKey(Node, on_delete=models.PROTECT)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.PROTECT, related_name="created_media"
    )

    modified_at = models.DateTimeField(auto_now=True, null=True)
    modified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="modified_media",
    )

    files = models.ManyToManyField("archive.ArchiveFile", blank=False)
    attachments = models.ManyToManyField(
        "archive.AttachmentFile", blank=True, related_name="is_attachment_for"
    )

    tags = models.ManyToManyField(Tag)

    objects = models.Manager()
    preview_manager = MediaPreviewManager()

    def __str__(self):
        return "Media ID {}".format(self.pk)

    @cached_property
    def is_public(self):
        if self.is_private:
            return False
        if self.embargo_end_date and self.embargo_end_date > date.today():
            return False

        return True

    @cached_property
    def currently_under_embargo(self):
        if self.embargo_end_date and self.embargo_end_date > date.today():
            return True

        return False

    @cached_property
    def primary_file(self):
        try:
            return self.files.all()[0]
        except IndexError:
            return None

    @cached_property
    def primary_image_webasset(self):

        primary_file = self.primary_file
        if primary_file is None:
            return None

        # performance optimization if the special manager was used
        if hasattr(primary_file, MediaPreviewManager.image_preview_attr):
            qs = getattr(primary_file, MediaPreviewManager.image_preview_attr)
        else:
            # else hit the database
            qs = primary_file.webasset_set.filter(mime_type__istartswith="image/")

        try:
            return qs[0]
        except IndexError:
            return None

    @cached_property
    def description_authors(self):
        return filter_by_prefix(self.tags.all(), "description_author:")

    @cached_property
    def location_tags(self):
        return filter_location_tags(self.tags.all())

    objects = MediaManager()

    class Meta:
        ordering = ("created_at",)
