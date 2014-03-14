# settings/dev.py

# Example use with manage.py:
# $ python manage.py runserver --settings=cltlanglab.settings.dev

from .base import *


DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []

# Append apps used in development not production.
INSTALLED_APPS += (
    'debug_toolbar',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'cltlangdb',
        'USER': 'djangodbuser',
        'PASSWORD': '1',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    }
}

# HEROKU SETUP? COMMENT OUT THE ABOVE DATABASE VARIABLE AND UNCOMMENT TWO LINES BELOW.
# This is in dev in cases where one needs to test with the heroku CLI foreman app

## import dj_database_url
## DATABASES['default'] =  dj_database_url.config()

