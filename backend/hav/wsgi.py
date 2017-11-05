"""
WSGI config for hav project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

from dotenv import load_dotenv


# load dotenv
project_root = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        '../..'
    )
)

dotenv_path = os.path.join(project_root, '.env')
if os.path.isfile(dotenv_path):
    load_dotenv(dotenv_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hav.settings")

application = get_wsgi_application()
