from rest_framework import serializers

from incoming.models import UploadedFile, UploadedFileFolder


class SimpleFolderSerializer(serializers.ModelSerializer):

    href = serializers.HyperlinkedIdentityField(view_name='api:folder')

    class Meta:
        model = UploadedFileFolder
        fields = [
            'pk',
            'href',
            'name',
            'created'
        ]


class FolderSerializer(serializers.ModelSerializer):

    children = SimpleFolderSerializer(many=True, read_only=True, source='get_children')
    ancestors = SimpleFolderSerializer(many=True, read_only=True, source='get_ancestors')

    class Meta:
        model = UploadedFileFolder
        fields = [
            'name',
            'description',
            'pk',
            'created',
            'modified',
            'children',
            'ancestors',
        ]

    def create(self, validated_data):
        # add user to the data
        if 'request' in self.context and self.context['request'].user.is_authenticated:
            validated_data.update({
                'created_by': self.context['request'].user
            })
        # either create a root node or a child
        if self.instance:
            folder = self.instance.add_child(**validated_data)
        else:
            folder = UploadedFileFolder.add_root(**validated_data)

        return folder



class UploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            'file',
        ]
