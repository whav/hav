from thumbor.loaders import file_loader
from thumbor.loaders import http_loader
from tornado.concurrent import return_future

from urllib import unqote

@return_future
def load(context, path, callback):

    unquoted_path = unquote(path)

    def callback_wrapper(result):
        if result.successful:
            callback(result)
        else:
            # If file_loader failed try http_loader
            http_loader.load(context, path, callback)

    # First attempt to load with file_loader
    file_loader.load(context, unquoted_path, callback_wrapper)