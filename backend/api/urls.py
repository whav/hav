from django.conf.urls import url, include
from django.views.generic import RedirectView

api_urls = [
    url(r'^v1/', include('api.v1.urls', namespace='v1')),
    url(r'^__api_auth__/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^$', RedirectView.as_view(pattern_name='api:v1:api_root', permanent=False))
]
