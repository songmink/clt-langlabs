"""
Django production settings for cltlanglab project.
"""
# settings/prod.py

from .base import *

DEBUG = False

TEMPLATE_DEBUG = False

# ! DO NOT EDIT THIS ON LOCAL ENVIRONMENTS! MEANT FOR PRODUCTION (but we want it in the repo).
ALLOWED_HOSTS = ['*.yourhost.com']

# Append apps needed in production.
# (nothing needed at the moment that is not specified in base.py)
# INSTALLED_APPS += ('someapp',)

# ! DO NOT EDIT THIS ON LOCAL ENVIRONMENTS! MEANT FOR PRODUCTION (but we want the structure in the repo).
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': '',
        'USER': '',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

# gevent.socket.io server settings
SYNCSERVER_HOST = ''
SSL_KEY = ''
SSL_CERT = ''

# Server side setup for Barebones Recorder
RECORDER_MYSERVER =""
RECORDER_MYHANDLER =""
RECORDER_MYDIRECTORY = ""
RECORDER_LICENSE = ''


STATIC_URL = ''

STATIC_ROOT = ''

MEDIA_URL = ''

MEDIA_ROOT = ''

# for braces login configuration
LOGIN_URL = ''

LOGIN_REDIRECT_URL = ''

REDIRECT_FIELD_NAME = ''