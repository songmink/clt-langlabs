"""
Django dev settings for cltlanglab project.
"""
# settings/dev.py

# Example use with manage.py:
# $ python manage.py runserver --settings=cltlanglab.settings.dev

from .base import *

# NEEDED for CAS logins on dev systems with OPENSSL < 1
import uhauth.tls_patch

#SECRET_KEY = os.environ['SECRET_KEY']
SECRET_KEY = '1asex8n(jcb1xump+ir@xn+1!(xcyxoif*xi@oy#9pyt-90le=@--da21'
DEBUG = True

TEMPLATE_DEBUG = True

# Added by Hao
DEBUG_TOOLBAR_PATCH_SETTINGS = False

ALLOWED_HOSTS = []

ROOT_URLCONF = 'cltlanglab.urls-dev'

# Append apps used in development not production.
INSTALLED_APPS += (
    # 'debug_toolbar',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cltlanglabs',
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


LOGIN_URL = '/cltlanglab/accounts/login/'
LOGOUT_URL = '/accounts/logout'

LOGIN_REDIRECT_URL = '/cltlanglab/home'
REDIRECT_FIELD_NAME = 'home'
