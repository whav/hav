from django.conf.urls import url, include
from django.contrib import admin as django_admin
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

from wagtail.wagtailadmin import urls as wagtailadmin_urls
from wagtail.wagtaildocs import urls as wagtaildocs_urls
from wagtail.wagtailcore import urls as wagtail_urls

from api.urls import api_urls
from incoming.views import debug


hav_admin_patterns = [
    url(r'', TemplateView.as_view(template_name='administration/index.html'), name='root')
]

urlpatterns = [
    url(
        r'^$',
        TemplateView.as_view(template_name='hav/teaser.html')
    ),
    # API urls
    url(r'^api/', include(api_urls, namespace='api')),
    url(r'^admin/', include(hav_admin_patterns, namespace='hav_admin')),
    url(r'^dbadmin/', django_admin.site.urls),
    url(r'^cms/', include(wagtailadmin_urls)),
    url(r'^documents/', include(wagtaildocs_urls)),
    url(r'^c/', include(wagtail_urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
