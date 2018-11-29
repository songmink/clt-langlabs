# cltlanglab/urls-dev.py urls for use in local development. key diff is a different login url is used (not cas).

from django.conf.urls import re_path, include, url
from django.contrib import admin
from django.contrib.auth.views import LoginView, LogoutView
from django.conf.urls.static import static
admin.autodiscover()

from core.views import IndexView, HomeView, CourseListView, CourseIndexView, CourseCreateView, CourseUpdateView, CourseDeleteView, CourseCopyView, ActivityCreateIndexView, LessonUpdateView, LessonCreateView, LessonAddView, PostDeleteView, PostSaveView, fileUpload, subscribeCourse, changePerm, copyActivity, editLessonTitle, editEssayDraft, uhcaslogout
from discussions.views import DiscussionCreateView, DiscussionDetailView, DiscussionUpdateView, DiscussionDeleteView
from essays.views import EssayCreateView, EssayDetailView, EssayUpdateView, EssayDeleteView, EssayResponseUpdateView
from overdub_discussions.views import OverdubCreateView, OverdubDetailView, OverdubUpdateView, OverdubDeleteView
from flatpage.views import FlatpageDetailView, FlatpageCreateView, FlatpageUpdateView, FlatpageDeleteView
from .settings import base
from flatpage.views import FlatpageDetailView, FlatpageCreateView, FlatpageUpdateView, FlatpageDeleteView, deleteAttachment
#import django_cas_ng
#import socketio.sdjango
#socketio.sdjango.autodiscover()

urlpatterns = [
    re_path(r'^course/(?P<pk>\d+)$', CourseIndexView.as_view(), name='course'),
    re_path(r'^course/add/$', CourseCreateView.as_view(), name='create_collection'),
    re_path(r'^course/edit/(?P<pk>\d+)$', CourseUpdateView.as_view(), name='edit_collection'),
    re_path(r'^course/delete/(?P<pk>\d+)$', CourseDeleteView.as_view(), name='delete_collection'),
    re_path(r'^course/copy/(\w+)/$', CourseCopyView, name='copy_collection'),
    re_path(r'^lesson/edit/(?P<pk>\d+)$', LessonUpdateView.as_view(), name='edit_lesson'),
    re_path(r'^lesson/add/(?P<addpk>\d+)$', LessonCreateView.as_view(), name='create_lesson'),
    re_path(r'^lesson/add2/(?P<addpk>\d+)$', LessonAddView.as_view(), name='add_lesson'),
    re_path(r'^activity/add/(?P<pk>\d+)$', ActivityCreateIndexView.as_view(), name='create_activity'),
    re_path(r'^discussion/(?P<pk>\d+)$', DiscussionDetailView.as_view(), name='discussion'),
    re_path(r'^discussion/add/(?P<pk>\d+)$', DiscussionCreateView.as_view(), name='create_discussion'),
    re_path(r'^discussion/edit/(?P<pk>\d+)$', DiscussionUpdateView.as_view(), name='edit_discussion'),
    re_path(r'^discussion/delete/(?P<pk>\d+)$', DiscussionDeleteView.as_view(), name='delete_discussion'),
    re_path(r'^essay/(?P<pk>\d+)$', EssayDetailView.as_view(), name='essay'),
    re_path(r'^essay/add/(?P<pk>\d+)$', EssayCreateView.as_view(), name='create_essay'),
    re_path(r'^essay/edit/(?P<pk>\d+)$', EssayUpdateView.as_view(), name='edit_essay'),
    re_path(r'^essay/delete/(?P<pk>\d+)$', EssayDeleteView.as_view(), name='delete_essay'),
    re_path(r'^essay/grade/(?P<pk>\d+)$', EssayResponseUpdateView.as_view(), name='grade_essay'),
    re_path(r'^flatpage/(?P<pk>\d+)$', FlatpageDetailView.as_view(), name='flatpage'),
    re_path(r'^flatpage/add/(?P<pk>\d+)$', FlatpageCreateView.as_view(), name='create_flatpage'),
    re_path(r'^flatpage/edit/(?P<pk>\d+)$', FlatpageUpdateView.as_view(), name='edit_flatpage'),
    re_path(r'^flatpage/delete/(?P<pk>\d+)$', FlatpageDeleteView.as_view(), name='delete_flatpage'),
    re_path(r'^attachment/delete/$', deleteAttachment, name='delete_attachment'),
    re_path(r'^overdub/(?P<pk>\d+)$', OverdubDetailView.as_view(), name='overdub'),
    re_path(r'^overdub/add/(?P<pk>\d+)$', OverdubCreateView.as_view(), name='create_overdub'),
    re_path(r'^overdub/edit/(?P<pk>\d+)$', OverdubUpdateView.as_view(), name='edit_overdub'),
    re_path(r'^overdub/delete/(?P<pk>\d+)$', OverdubDeleteView.as_view(), name='delete_overdub'),
    re_path(r'^searchcourse/$', CourseListView.as_view(), name='course_list'),
    re_path(r'^post/save/$',PostSaveView.as_view(), name='save_post'),
    re_path(r'^post/delete/$', PostDeleteView.as_view(), name='delete_post'),
    re_path(r'^upload/$', fileUpload, name='file_upload'),
    re_path(r'^subscribe/(\w+)/$', subscribeCourse, name='subscribe_course'),
    re_path(r'^perm/change/$', changePerm, name='change_perm'),
    re_path(r'^activity/copy/$', copyActivity, name='copy_activity'),
    re_path(r'^lesson/title/edit/$', editLessonTitle, name='edit_lesson_title'),
    re_path(r'^essaydraft/edit/$', editEssayDraft, name='edit_essay_draft'),

    re_path(r'^admin/', admin.site.urls),
    #re_path(r'^socket\.io', include(socketio.sdjango.urls)),
    re_path(r'^accounts/login/$', LoginView, name='login'),
    re_path(r'^logout/$', LogoutView, name='logout'),
#
    # re_path(r'^accounts/login/$', 'django_cas.views.login', name='login'),
    # re_path(r'^accounts/logout/$', uhcaslogout, name='logout'),

    # re_path(r'^accounts/login/$', 'django_cas_ng.views.login', name='login'),
    # re_path(r'^accounts/logout/$', uhcaslogout, name='logout'),
    # re_path(r'^accounts/callback$', 'django_cas_ng.views.callback', name='cas_ng_proxy_callback'),

    #re_path(r'^crossdomain.xml$',flashpolicies.views.simple,{'domains': ['*']}), #no more support
    re_path(r'^home/$', HomeView.as_view(), name='home'),
    re_path(r'^$', IndexView.as_view(), name='landing'),
    re_path(r'^profile/', include('user_profile.urls', namespace='profile')),

]
urlpatterns += static(base.MEDIA_URL, document_root=base.MEDIA_ROOT)
urlpatterns += static(base.STATIC_URL, document_root=base.STATIC_ROOT)
