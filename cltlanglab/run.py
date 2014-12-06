"""
Cltlanglab Chat Server configuration file
"""
# run.py
#!/usr/bin/env python
import os, sys
from gevent import monkey
from socketio.server import SocketIOServer

# Need to add the project directory to the system path for this script.
from settings import base
sys.path.insert(0, os.path.abspath(str(base.PROJECT_DIR)))

import django
from django.core.wsgi import get_wsgi_application
from django.db import connections

# The setup command implicitly uses os.environ['DJANGO_SETTINGS_MODULE']
django.setup()
monkey.patch_all()
PORT = 8001


# Connect to django db
connections['default'].allow_thread_sharing = True

application = get_wsgi_application()

if __name__ == '__main__':
    print 'Listening on http://localhost:%s and on port 8001 (flash policy server)' % PORT
    SocketIOServer(('localhost', PORT), application, resource="socket.io").serve_forever()

