"""
Django dev settings for cltlanglab project.
"""
# settings/dev.py

# Example use with manage.py:
# $ python manage.py runserver --settings=cltlanglab.settings.dev

from .base import *

SECRET_KEY = os.environ['SECRET_KEY']

DEBUG = True

TEMPLATE_DEBUG = True

# Added by Hao
DEBUG_TOOLBAR_PATCH_SETTINGS = False

ALLOWED_HOSTS = []

# Append apps used in development not production.
INSTALLED_APPS += (
    # 'debug_toolbar',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'cltlangdb',
        'USER': 'djangodbuser',
        'PASSWORD': '1',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Server side setup for Barebones Recorder
RECORDER_MYSERVER ="http://localhost/"
RECORDER_MYHANDLER ="phpinc/save-v7.php"
RECORDER_MYDIRECTORY = "uploads"
RECORDER_LICENSE = ''
