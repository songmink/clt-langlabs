# uhauth/backends.py
"""
    Using/subclassing django-cas downloaded from here:
    https://bitbucket.org/cpcc/django-cas/overview

    Installed with python setup.py install in a virtualenv of course
"""
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType

from django_cas.backends import CASBackend

from core.models import ActivityCollection


class UHCASBackend(CASBackend):

    """CAS authentication backend with user data populated from UH LDAP"""

    def authenticate(self, ticket, service, request):
        """
        Authenticates CAS ticket and authenticates a user. No additional attributes other than username are returned.
        Works with CAS_VERSION = '1' set in settings file.
        """

        user = super(UHCASBackend, self).authenticate(ticket, service, request)
        return user


class UHCASAttributesBackend(CASBackend):

    """CAS authentication backend with user data populated from UH LDAP"""

    def authenticate(self, ticket, service, request):
        """
        Authenticates CAS ticket and retrieves additional (exposed) user data.
        Works only if CAS_VERSION = 'CAS_2_SAML_1_0' is set in the settings file.
        """

        user = super(UHCASAttributesBackend, self).authenticate(ticket, service, request)

        try:
            user_attrs = request.session['attributes']
            if not user.first_name:
                user.first_name = user_attrs['givenName']
            if not user.last_name:
                user.last_name = user_attrs['sn']
            user.save()
        except:
            pass

        # try:
            uh_affiliation = user_attrs['eduPersonAffiliation']
        # except:
            # uh_affiliation = []

        """
            If user is staff or faculty, add a create_course permission to their user account.
            Only needed here if this is not assigned from a previous login. Non staff/faculty can
            get this permission assigned through admin panel (by system or staff admin)
        """
        if 'faculty' in uh_affiliation or 'staff' in uh_affiliation:

            if not user.has_perm('core.create_course'):
                content_type = ContentType.objects.get_for_model(ActivityCollection)
                permission = Permission.objects.get(codename='create_course', content_type=content_type)
                user.user_permissions.add(permission)

        return user
