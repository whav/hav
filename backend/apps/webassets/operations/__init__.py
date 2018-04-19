import mimetypes
from apps.archive.models import ArchiveFile
from ..models import WebAsset

from .image import convert as image_convert
from .audio import convert as audio_convert
from .video import convert as video_convert



def create_webassets(archived_file_id):
    af = ArchiveFile.objects.get(pk=archived_file_id)
    wa = WebAsset(archivefile=af)
    source_file_name = af.file.path
    source_mime = mimetypes.guess_type(source_file_name)[0]
    if source_mime is None:
        raise AssertionError('Could not determine mime type of file %s' % source_file_name)

    type = source_mime.split('/')[0]
    if type not in ['image', 'video', 'audio']:
        raise AssertionError('Unable to process file %s of type %s.' % (source_file_name, source_mime))

    if type == 'image':
        convert = image_convert
    elif type == 'video':
        convert = video_convert
    elif type == 'audio':
        convert = audio_convert
    else:
        raise NotImplementedError('Webasset creation not yet implemented for type %s' % source_mime)

    target_file_name = wa.get_available_file_name(convert.extension)

    convert(source_file_name, target_file_name, af)