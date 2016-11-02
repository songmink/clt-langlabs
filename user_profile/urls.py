from django.conf.urls import patterns, include, url
from user_profile.views import ProfileDetailView, ProfileUpdateView

urlpatterns = patterns('',
    url(r'^(?P<slug>[\w-]+)/$', ProfileDetailView.as_view(), name='detail'),
    url(r'^(?P<slug>[\w-]+)/update/$', ProfileUpdateView.as_view(), name='update'),
)
