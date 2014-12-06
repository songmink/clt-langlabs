"""
Django production settings for cltlanglab project.
"""
# settings/prod.py

from .base import *
# import dj_database_url

DEBUG = False

TEMPLATE_DEBUG = False

# ! DO NOT EDIT THIS ON LOCAL ENVIRONMENTS! MEANT FOR PRODUCTION (but we want it in the repo).
ALLOWED_HOSTS = ['*.yourhost.com']

# Append apps needed in production.
# (nothing needed at the moment that is not specified in base.py)
# INSTALLED_APPS += ('someapp',)

# ! DO NOT EDIT THIS ON LOCAL ENVIRONMENTS! MEANT FOR PRODUCTION (but we want it in the repo).
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

# HEROKU SETUP? COMMENT OUT THE ABOVE DATABASE VARIABLE AND UNCOMMENT THIS.
## DATABASES['default'] =  dj_database_url.config()
