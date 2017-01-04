from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from api.urls import api_urls
from incoming.views import debug

urlpatterns = [
    url(r'^dbadmin/', admin.site.urls),
    url(
        r'^$',
        TemplateView.as_view(template_name='hav/index.html')
    ),
    # API urls
    url(r'api/', include(api_urls, namespace='api')),
    url(r'admin/', debug)
]


