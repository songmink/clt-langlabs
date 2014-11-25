# cltlanglab/urls.py

from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf.urls.static import static
admin.autodiscover()

from core.views import HomeView, CourseListView, CourseIndexView, CourseCreateView, CourseUpdateView, CourseDeleteView, CourseCopyView, ActivityCreateIndexView, LessonCreateView, LessonAddView, savePost, fileUpload, subscribeCourse, changePerm, copyActivity, editLessonTitle, editEssayDraft
from discussions.views import DiscussionCreateView, DiscussionDetailView, DiscussionUpdateView, DiscussionDeleteView
from essays.views import EssayCreateView, EssayDetailView, EssayUpdateView, EssayDeleteView, EssayResponseUpdateView
from overdub_discussions.views import OverdubCreateView, OverdubDetailView, OverdubUpdateView, OverdubDeleteView
from settings import base
import socketio.sdjango
socketio.sdjango.autodiscover()


urlpatterns = patterns('',

    url(r'^course/(?P<pk>\d+)$', CourseIndexView.as_view(), name='course'),
    url(r'^course/add/$', CourseCreateView.as_view(), name='create_collection'),
    url(r'^course/edit/(?P<pk>\d+)$', CourseUpdateView.as_view(), name='edit_collection'),
    url(r'^course/delete/(?P<pk>\d+)$', CourseDeleteView.as_view(), name='delete_collection'),
    url(r'^course/copy/(\w+)/$', CourseCopyView, name='copy_collection'),
    url(r'^lesson/add/(?P<addpk>\d+)$', LessonCreateView.as_view(), name='create_lesson'),
    url(r'^lesson/add2/(?P<addpk>\d+)$', LessonAddView.as_view(), name='add_lesson'),
    url(r'^activity/add/(?P<pk>\d+)$', ActivityCreateIndexView.as_view(), name='create_activity'),
    url(r'^discussion/(?P<pk>\d+)$', DiscussionDetailView.as_view(), name='discussion'),
    url(r'^discussion/add/(?P<pk>\d+)$', DiscussionCreateView.as_view(), name='create_discussion'),
    url(r'^discussion/edit/(?P<pk>\d+)$', DiscussionUpdateView.as_view(), name='edit_discussion'),
    url(r'^discussion/delete/(?P<pk>\d+)$', DiscussionDeleteView.as_view(), name='delete_discussion'),
    url(r'^essay/(?P<pk>\d+)$', EssayDetailView.as_view(), name='essay'),
    url(r'^essay/add/(?P<pk>\d+)$', EssayCreateView.as_view(), name='create_essay'),
    url(r'^essay/edit/(?P<pk>\d+)$', EssayUpdateView.as_view(), name='edit_essay'),
    url(r'^essay/delete/(?P<pk>\d+)$', EssayDeleteView.as_view(), name='delete_essay'),
    url(r'^essay/grade/(?P<pk>\d+)$', EssayResponseUpdateView.as_view(), name='grade_essay'),
    url(r'^overdub/(?P<pk>\d+)$', OverdubDetailView.as_view(), name='overdub'),
    url(r'^overdub/add/(?P<pk>\d+)$', OverdubCreateView.as_view(), name='create_overdub'),
    url(r'^overdub/edit/(?P<pk>\d+)$', OverdubUpdateView.as_view(), name='edit_overdub'),
    url(r'^overdub/delete/(?P<pk>\d+)$', OverdubDeleteView.as_view(), name='delete_overdub'),
    url(r'^searchcourse/$', CourseListView.as_view(), name='course_list'),
    url(r'^post/save/$',savePost, name='save_post'),
    url(r'^upload/$', fileUpload, name='file_upload'),
    url(r'^subscribe/(\w+)/$', subscribeCourse, name='subscribe_course'),
    url(r'^perm/change/$', changePerm, name='change_perm'),
    url(r'^activity/copy/$', copyActivity, name='copy_activity'),
    url(r'^lesson/title/edit/$', editLessonTitle, name='edit_lesson_title'),
    url(r'^essaydraft/edit/$', editEssayDraft, name='edit_essay_draft'),
    
    url(r'^admin/', include(admin.site.urls)),
    url(r'^socket\.io', include(socketio.sdjango.urls)),

    url(r'^accounts/login/$', 'django.contrib.auth.views.login', name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout', name='logout'),
    url(r'^crossdomain.xml$','flashpolicies.views.simple',{'domains': ['*']}),    
    url(r'^$', HomeView.as_view(), name='home'),    

)+ static(base.MEDIA_URL, document_root=base.MEDIA_ROOT)