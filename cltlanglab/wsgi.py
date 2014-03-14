"""
WSGI config for cltlanglab project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import os
# This implies running the project on production server. Note the use of prod settings module.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cltlanglab.settings.prod")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# HEROKU SETUP?
# Comment application variable above and uncomment the two below.
# from dj_static import Cling
# application = Cling(get_wsgi_application())
