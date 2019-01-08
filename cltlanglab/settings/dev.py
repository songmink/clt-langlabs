"""
Django dev settings for cltlanglab project.
"""
# settings/dev.py

# Example use with manage.py:
# $ python manage.py runserver --settings=cltlanglab.settings.dev

from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '&#m+uzyu315+bpp7yhb$gsj%3d&d0p1gnw0qe@o@qd=r3e%8#m'
ALLOWED_HOSTS = ['*']
DEBUG = True
TEMPLATE_DEBUG = True

# Append apps used in development not production.
INSTALLED_APPS += (
    # 'debug_toolbar',
)

DATABASES = {
    'default': {
        'CONN_MAX_AGE': 0,
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'localhost',
        'NAME': 'clt_langlabs',
        'PASSWORD': '',
        'PORT': '',
        'USER': 'songmink'
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


# CAS SETUP #

# MIDDLEWARE_CLASSES += ('django_cas.middleware.CASMiddleware',)
#
# AUTHENTICATION_BACKENDS += (
#     'uhauth.backends.UHCASAttributesBackend',
#     # 'django_cas_ng.backends.CASBackend',
# )
#
# CAS_SERVER_URL = 'https://cas-test.its.hawaii.edu/cas/'
# CAS_VERSION = 'CAS_2_SAML_1_0'
# # CAS_VERSION = '3'
# CAS_REDIRECT_URL = '/'

# END CAS #


LOGIN_URL = '/accounts/login/'
LOGOUT_URL = '/accounts/logout'

LOGIN_REDIRECT_URL = '/cltlanglab/home'
REDIRECT_FIELD_NAME = 'home'
