from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from .api.urls import api_urls
from incoming.views import debug

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(
        r'^$',
        TemplateView.as_view(template_name='index.html')
    ),
    url(r'incoming/$', debug),
    # API urls
    url(r'api/', include(api_urls, namespace='api')),
    url(r'^__api_auth__/', include('rest_framework.urls', namespace='rest_framework'))
]


