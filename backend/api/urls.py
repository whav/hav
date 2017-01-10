from django.conf.urls import url, include

api_urls = [
    url(r'^v1/', include('api.v1.urls', namespace='v1')),
    url(r'^__api_auth__/', include('rest_framework.urls', namespace='rest_framework'))
]
