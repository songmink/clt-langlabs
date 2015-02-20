"""
Django base settings for cltlanglab project.
"""
import os
from unipath import Path

# Secret key stored in environment variable not here.
#SECRET_KEY = os.environ['SECRET_KEY']

PROJECT_DIR = Path(__file__).ancestor(3)  # Points to <project root> (e.g. clt-langlabs-dev-py)

MEDIA_URL = '/media/'
MEDIA_ROOT = PROJECT_DIR.child('media')

# Disable this when static directories are managed outside of individual apps
# E.g., in the project root as we are doing in this project.
# STATIC_ROOT = PROJECT_DIR.child('static')

STATICFILES_DIRS = (
    PROJECT_DIR.child('static'),
)

STATIC_URL = '/static/'

TEMPLATE_DIRS = (PROJECT_DIR.child('templates'),)

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Project apps:
     'discussions',
     'overdub_discussions',
     'essays',
     'core',

    # Utils:
    'crispy_forms',
    'guardian',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django_cas.middleware.CASMiddleware',   
)

ROOT_URLCONF = 'cltlanglab.urls'

WSGI_APPLICATION = 'cltlanglab.wsgi.application'

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Pacific/Honolulu'

USE_I18N = True

USE_L10N = True

USE_TZ = True

CRISPY_TEMPLATE_PACK = 'bootstrap3'

LOGIN_URL = '/accounts/login/'

LOGIN_REDIRECT_URL = '/'

REDIRECT_FIELD_NAME = 'home'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
    'django_cas.backends.CASBackend',
)

ANONYMOUS_USER_ID = -1

# Potential sockets setup
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'simple'
        },
    },
    'loggers': {
        'django': {
            'handlers':['console'],
            'propagate': True,
            'level':'INFO',
        },
        'socketio': {
            'handlers':['console'],
            'propagate': True,
            'level':'INFO',
        },
    },
}
#########################

# HEROKU SETUP?

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
## SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
