from django.contrib.auth.mixins import UserPassesTestMixin
from graphene_django.views import GraphQLView


class ProtectedGraphQLView(UserPassesTestMixin, GraphQLView):
    def test_func(self):
        return self.request.user.is_superuser
