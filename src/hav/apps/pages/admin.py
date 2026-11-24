from django.contrib import admin

from hav.apps.theme.content import validate_content

from .models import Page


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    """Pages can only be seen and edited by superusers."""

    list_display = ["title", "slug"]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == "content":
            field.validators.append(validate_content)
        return field

    def has_module_permission(self, request):
        return request.user.is_active and request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return self.has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_delete_permission(self, request, obj=None):
        return self.has_module_permission(request)
