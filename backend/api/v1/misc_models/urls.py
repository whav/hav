from django.urls import path
from .views import MediaCreatorAPI, MediaCreatorRoleAPI, MediaLicenseAPI, TagAutocompleteView

urlpatterns = [
    path('creators/', MediaCreatorAPI.as_view(), name='creators'),
    path('licenses/', MediaLicenseAPI.as_view(), name='licenses'),
    path('creator_roles/', MediaCreatorRoleAPI.as_view(), name='creator_roles'),
    path('tags/', TagAutocompleteView.as_view(), name='tag_autocomplete')
]
