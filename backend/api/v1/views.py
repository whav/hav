from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse

# from django.urls import reverse


class AuthView(APIView):
    def get(self, request, format=None):
        user = request.user
        response = {
            "username": None,
            "authenticated": False,
            "login_url": reverse("login", request=request),
            "logout_url": reverse("logout", request=request),
            "areas": [],
        }

        if user.is_authenticated:
            response.update({"username": user.username, "authenticated": True})

            if user.is_staff:
                response.update(
                    {
                        "areas": [
                            {
                                "name": "Admin",
                                "url": reverse("admin:index", request=request),
                            }
                        ]
                    }
                )

        return Response(response)
