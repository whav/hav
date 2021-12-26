from django.urls import include, path, re_path
from django.contrib import admin as django_admin
from django.conf import settings
from django.views.generic import TemplateView
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth import views as auth_views
from django.http import HttpResponseRedirect
from apps.archive.urls import urlpatterns as archive_urls
from apps.media.urls import urlpatterns as media_urls
from api.urls import api_urls
from .ui_urls import urlpatterns as dj_urlpatterns

django_admin.site.site_header = "HAV Administration"
django_admin.site.site_title = "HAV Admin"
# django_admin.site.disable_action("delete_selected")

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
    path("login/", auth_views.LoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
]

urlpatterns = [
    re_path(r"^api/", include((api_urls, "api"), namespace="api")),
    re_path(r"^admin/", include(hav_admin_patterns, namespace="hav_admin")),
    re_path(r"^dbadmin/", django_admin.site.urls),
    path("rq/", include("django_rq.urls")),
    path("account/", include((account_patterns, "auth"), namespace="auth")),
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


def dummy_view(request):
    from django.http import Http404

    raise Http404("This should never hit the server.")


def frontend_redirect(request, *args, **kwargs):
    if settings.DEBUG and request.headers.get("host") in [
        "localhost:8000",
        "127.0.0.1:8000",
    ]:
        return HttpResponseRedirect("http://127.0.0.1:3000" + request.path)
    raise NotImplementedError()


# namespace the whole django patterns under /d
urlpatterns = [
    re_path(r"^$", TemplateView.as_view(template_name="hav/teaser.html")),
    path("collections/<path:p>", frontend_redirect),
    path("archive/", include((archive_urls, "archive"), namespace="archive")),
    path("media/", include((media_urls, "media"), namespace="media")),
    path("d/", include(urlpatterns)),
    path("protected/download/<path:path>", dummy_view, name="protected_download"),
    path("ui/", include((dj_urlpatterns, "hav"), namespace="hav")),
]
