"""
WSGI config for cltlanglab project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import os
import sys
# This implies running the project on production server. Note the use of prod settings module.
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cltlanglab.settings.prod")

# THIS WSGI IS NOT USED FOR PRODUCTION
sys.path.append('/pythonweb/clt-langlabs-dev-py')


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cltlanglab.settings.")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
