# settings/testServer.py

# Example use with manage.py:
# $ python manage.py runserver --settings=cltlanglab.settings.testServer

from .dev import *


STATIC_URL = '/static/cltlanglabs/'

STATIC_ROOT = '/web/static/cltlanglabs'

MEDIA_URL = '/media/cltlanglabs/'

MEDIA_ROOT = '/web/media/cltlanglabs'

# for braces login configuration
LOGIN_URL = '/cltlanglabs/accounts/login/'

LOGIN_REDIRECT_URL = '/cltlanglabs'

REDIRECT_FIELD_NAME = 'home'