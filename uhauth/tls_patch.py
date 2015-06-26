# tls_patch.py
# patch to force TLSv1 protocol in python's ssl module
# really only necessary on systems (e.g. mac os x dev machines with openssl < 1)
import functools
import ssl

ssl_init = ssl.SSLSocket.__init__


@functools.wraps(ssl_init)
def force_tls(self, *args, **kwargs):
    kwargs['ssl_version'] = ssl.PROTOCOL_TLSv1
    ssl_init(self, *args, **kwargs)

ssl.SSLSocket.__init__ = force_tls
