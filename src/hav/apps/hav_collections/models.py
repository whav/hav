from django.db import models

from ..accounts.models import User
from ..sets.models import Node


def root_nodes():
    return {"pk__in": Node.objects.filter(depth__lte=2).values_list("pk", flat=True)}


class Collection(models.Model):
    TYPE_CHOICES = [(1, "private"), (2, "projects"), (3, "special")]

    slug = models.SlugField()
    name = models.CharField(unique=True, max_length=200)
    short_name = models.CharField(unique=True, max_length=30, blank=True)
    type = models.IntegerField(choices=TYPE_CHOICES, default=1)
    hide_browser_at_root_level = models.BooleanField(default=False)

    administrators = models.ManyToManyField(User)

    public = models.BooleanField(default=True)

    root_node = models.OneToOneField(
        Node,
        null=True,
        on_delete=models.PROTECT,
        limit_choices_to={"depth__lte": 3},
        unique=True,
    )

    def is_admin(self, user: User):
        return user in self.administrators.all()

    def __str__(self):
        return self.slug
