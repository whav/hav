from django.urls import include, path, re_path
from django.contrib import admin as django_admin
from django.conf import settings
from django.views.generic import TemplateView
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth.views import LoginView

from api.urls import api_urls

hav_admin_patterns = (
    [
        re_path(
            r"",
            user_passes_test(lambda u: u.is_superuser)(
                TemplateView.as_view(template_name="administration/index.html")
            ),
            name="root",
        )
    ],
    "hav_admin",
)

account_patterns = [
    path("login/", LoginView.as_view())
]

urlpatterns = [
    re_path(r"^api/", include((api_urls, "api"), namespace="api")),
    re_path(r"^admin/", include(hav_admin_patterns, namespace="hav_admin")),
    re_path(r"^dbadmin/", django_admin.site.urls),
    path("rq/", include("django_rq.urls")),
]


if settings.DEBUG:
    import debug_toolbar
    from django.conf.urls.static import static

    urlpatterns += [
        re_path(r"^__debug__/", include(debug_toolbar.urls)),
    ]

    # serve webassets in development
    wa_config = settings.STORAGES["webassets"]
    urlpatterns += static(wa_config["base_url"], document_root=wa_config["location"])

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# namespace the whole django patterns under /d
urlpatterns = [
    re_path(r"^$", TemplateView.as_view(template_name="tw/base.html")),
    path("d/", include(urlpatterns)),
    path("account/", include((account_patterns, 'auth'), namespace='auth'))
]
