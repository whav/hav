from django.conf.urls import url
from .views import debugView, CollectionView, LandingPage

urlpatterns = [
    url(r'^$', LandingPage.as_view(), name='landing_page'),
    url(r'^(?P<collection_name>\w+)/$', CollectionView.as_view(), name='collection_detail'),
    url(r'^(?P<path>.*/)?', debugView)
]
