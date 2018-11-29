from django.conf.urls import re_path, include, url
from user_profile.views import ProfileDetailView, ProfileUpdateView

app_name = 'profile'
urlpatterns = [
    re_path(r'^(?P<slug>[\w-]+)/$', ProfileDetailView.as_view(), name='detail'),
    re_path(r'^(?P<slug>[\w-]+)/update/$', ProfileUpdateView.as_view(), name='update'),
]