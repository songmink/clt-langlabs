# utils/gen-django-secret-key.py

# Usage: $ python gen-django-secret-key.py

# Will print a new secret key to use with django project.

from django.utils.crypto import get_random_string

chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'

print get_random_string(50, chars) 