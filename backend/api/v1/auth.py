from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.response import Response
from django.urls import reverse
from apps.accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

class AuthStatusView(APIView):
    def get(self, request, format=None):
        data = {
            "isAuthenticated": False,
            "loginURL": request.build_absolute_uri(reverse('auth:login')),
            "logoutURL": request.build_absolute_uri(reverse('auth:logout')),
            "user": None
        }
        if request.user.is_authenticated:
            data.update({
                "isAuthenticated": True,
                "user": UserSerializer(instance=request.user).data
            })

        return Response(data)

