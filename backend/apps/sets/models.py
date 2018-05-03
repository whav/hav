from django.db import models
from treebeard.mp_tree import MP_Node


class Node(MP_Node):

    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

#
