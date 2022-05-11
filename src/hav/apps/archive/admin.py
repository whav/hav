from pathlib import Path

from django.contrib import admin
from django.template.defaultfilters import filesizeformat

from ..hav_collections.models import Collection
from .models import ArchiveFile, AttachmentFile


class FileExtensionFilter(admin.SimpleListFilter):
    title = "File extension"
    parameter_name = "ext"

    def lookups(self, request, model_admin):
        filenames = ArchiveFile.objects.values_list("original_filename", flat=True)
        extensions = set([Path(x).suffix.lower() for x in filenames])
        return [(e, e) for e in extensions]

    def queryset(self, request, queryset):
        ext = self.value()
        if ext:
            return queryset.filter(original_filename__iendswith=ext)


class CollectionListFilter(admin.SimpleListFilter):
    # Human-readable title which will be displayed in the
    # right admin sidebar just above the filter options.
    title = "Collection"

    # Parameter for the filter that will be used in the URL query.
    parameter_name = "collection"

    def lookups(self, request, model_admin):
        return Collection.objects.values_list("slug", "name")

    def queryset(self, request, queryset):
        """
        Returns the filtered queryset based on the value
        provided in the query string and retrievable via
        `self.value()`.
        """
        if self.value():
            return queryset.filter(media__collection__slug=self.value())


class ArchiveFileModelAdmin(admin.ModelAdmin):

    list_display = [
        "original_filename",
        "filesize",
        "created_at",
        "collection",
    ]
    list_filter = [CollectionListFilter, FileExtensionFilter]
    actions = ["recreate_webassets"]
    search_fields = ["original_filename"]

    def get_queryset(self, request):
        return ArchiveFile.objects.prefetch_related("media_set__collection").all()

    def collection(self, af):
        return af.media_set.all()[0].collection.slug

    def filesize(self, af):
        return filesizeformat(af.file.size)

    def recreate_webassets(self, request, queryset):
        from ..webassets.tasks import create

        for af in queryset:
            af.webasset_set.all().delete()
            create.delay(af.pk)

        self.message_user(
            request,
            f"{queryset.count()} files have been queued for webasset generation.",
        )

    recreate_webassets.short_description = "Recreate webassets for the selected files."


admin.site.register(ArchiveFile, ArchiveFileModelAdmin)
admin.site.register(AttachmentFile, ArchiveFileModelAdmin)
