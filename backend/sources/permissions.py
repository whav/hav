from rest_framework.permissions import IsAdminUser


class IncomingBaseMixin(object):
    permission_classes = (IsAdminUser,)
