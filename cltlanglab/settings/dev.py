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

# gevent.socket.io server settings (ssl not used in development)
CHAT_SERVER_PROTOCOL = 'http'
CHAT_SERVER_HOST = 'localhost'
CHAT_SERVER_PORT = '8001'

# Server side setup for Barebones Recorder
RECORDER_MYSERVER ="http://localhost/"
RECORDER_MYHANDLER ="phpinc/save-v7.php"
RECORDER_MYDIRECTORY = "uploads"
RECORDER_LICENSE = ''

CAS_SERVER_URL = 'https://cas-test.its.hawaii.edu/cas/'
CAS_REDIRECT_URL = '/'
CAS_VERSION = '1'
