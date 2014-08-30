# run.py
#!/usr/bin/env python
from gevent import monkey
from socketio.server import SocketIOServer
import django.core.handlers.wsgi
import os
import sys
from django.db import connections

monkey.patch_all()



try:
    import settings.dev
except ImportError:
    sys.stderr.write("Error: Can't find the file 'settings.py' in the directory containing %r. It appears you've customized things.\nYou'll have to run django-admin.py, passing it your settings module.\n(If the file settings.py does indeed exist, it's causing an ImportError somehow.)\n" % __file__)
    sys.exit(1)

PORT = 8001

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings.dev'

########## This should do the trick ###########
connections['default'].allow_thread_sharing = True

application = django.core.handlers.wsgi.WSGIHandler()

sys.path.insert(0, os.path.join(settings.dev.PROJECT_DIR, ""))

if __name__ == '__main__':
    print 'Listening on http://192.168.1.8:%s and on port 8001 (flash policy server)' % PORT
    SocketIOServer(('192.168.1.8', PORT), application, resource="socket.io").serve_forever()
