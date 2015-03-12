# core/views.py
import json
from datetime import datetime
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from urllib import urlencode
from urlparse import urljoin
from django.conf import settings

from braces.views import LoginRequiredMixin, CsrfExemptMixin, JSONResponseMixin, AjaxResponseMixin
from guardian.shortcuts import assign_perm, remove_perm
from guardian.mixins import PermissionRequiredMixin

from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.views.generic import DetailView, CreateView, View
from django.views.generic.edit import UpdateView, DeleteView
from django.core.urlresolvers import reverse_lazy
from django.core.exceptions import PermissionDenied
from django.shortcuts import render_to_response
from itertools import chain

from core.mixins import CourseListMixin, ActivityListMixin, UsersWithPermsMixin, FakeDeleteMixin, DeletePostMixin

from .models import ActivityCollection, Lesson, Post, Document

from discussions.models import DiscussionActivity
from essays.models import EssayActivity, EssayResponse
from overdub_discussions.models import OverdubActivity


class IndexView(TemplateView):
    ''' -- Landing page of cltlanglabs '''
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)
        mood = datetime.now().time().second/60.0              
        if mood > .80:
            context['moodtext'] = 'white'
        else:
            context['moodtext'] = 'black'

        context['moodlight'] = '%.2f' % (mood)
        return context  


class HomeView(LoginRequiredMixin, CourseListMixin, TemplateView):
    ''' -- Homepage of cltlanglabs '''
    template_name = 'home.html'

class CourseListView(LoginRequiredMixin, CourseListMixin,ListView):
    ''' -- Course Search Page '''
    model = ActivityCollection
    context_object_name = 'courses'
    template_name = 'course_list.html'

    def get_queryset(self):
        return ActivityCollection.objects.filter(is_active=True, is_deleted=False).all()

    def get_context_data(self, **kwargs):
        context = super(CourseListView, self).get_context_data(**kwargs)
        # try:
        data = []
        courses=self.get_queryset()
        for course in courses:
            private_users=[]
            for private_user in course.get_private_users():
                private_users.append(private_user.username)
            data.append({"course_name":course.title, "instructors":private_users})
        context['courses_json'] = json.dumps(data)
        # except: 
            # pass
        return context

class CourseIndexView(LoginRequiredMixin, CourseListMixin, ActivityListMixin, UsersWithPermsMixin, DetailView):
    ''' -- User's homepage, a list of courses '''

    model = ActivityCollection
    context_object_name = 'course'
    template_name = 'course.html'

    def get_object(self, queryset=None):
        obj = super(CourseIndexView, self).get_object(queryset)
        if (not self.request.user.has_perm("core.edit_course", obj)) & (not obj.is_active):
            raise PermissionDenied()
        return obj


class CourseCreateView(LoginRequiredMixin, CourseListMixin, CreateView):
    ''' -- Course Create Page '''

    model = ActivityCollection
    template_name = 'collection_create.html'
    fields = ['title', 'nickname', 'description', 'accesscode', 'is_active','is_public']

    def form_valid(self, form):
        form.save()
        assign_perm('core.edit_course', self.request.user, form.instance)
        return super(CourseCreateView, self).form_valid(form)
  # def form_valid(self, form):
    #     newcourse = form.save(commit=False)
    #     newcourse.save()
    #     currentUser = self.request.user
    #     newcourse.membership.add(currentUser)
    #     form.save_m2m()
    #     return super(CourseCreateView, self).form_valid(form)

class CourseUpdateView(LoginRequiredMixin, PermissionRequiredMixin, CourseListMixin, UpdateView):
    ''' -- Course Edit Page '''

    model = ActivityCollection
    template_name = 'collection_edit.html'
    fields = ['title', 'nickname', 'description', 'accesscode', 'is_active','is_public']
    permission_required = 'core.edit_course'
    raise_exception = True

    def form_valid(self, form):
        form.save()
        assign_perm('core.edit_course', self.request.user, form.instance)
        return super(CourseUpdateView, self).form_valid(form)

class CourseDeleteView(LoginRequiredMixin, PermissionRequiredMixin, CourseListMixin, FakeDeleteMixin, DeleteView):  #FakeDeleteMixin, 
    ''' -- Course Delete Page '''

    model = ActivityCollection
    success_url = reverse_lazy('home')
    template_name = 'activity_delete.html'
    permission_required = 'core.edit_course'
    raise_exception = True

class LessonCreateView(LoginRequiredMixin, CourseListMixin, CreateView):
    ''' -- Lesson Create Page '''

    model = Lesson
    template_name = 'lesson_create.html'
    fields = ['title', 'description']

    def form_valid(self, form):
    # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['addpk'])
        return super(LessonCreateView, self).form_valid(form)

    def get_success_url(self):
        return self.object.collection.get_absolute_url()


class ActivityCreateIndexView(LoginRequiredMixin, CourseListMixin, ActivityListMixin, DetailView):
    ''' -- Activity Create Index Page: users select from a list of available activity types. '''

    model = ActivityCollection
    context_object_name = 'course'
    template_name = "activity_create_index.html"


# Used in the iframe when adding lesson on the fly
class LessonAddView(LessonCreateView):
    ''' -- This is a simple version of Lesson Create Page used by an iframe in Activity Create/Edit Page to add lesson on the fly. '''

    template_name = 'lesson_create_2.html'

    def form_valid(self, form):
    # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['addpk'])
        return super(LessonAddView, self).form_valid(form)

    def get_success_url(self):
        return self.object.collection.get_absolute_url()




class PostDeleteView(CsrfExemptMixin, JSONResponseMixin, AjaxResponseMixin, DeletePostMixin, View):
    ''' '''

    def post_ajax(self, request, *args, **kwargs):
        ''' blah blah blah good documentation '''
    
        post_id = request.post_id
        post = Post.objects.get(pk=post_id)
        print post
    
        # delete any children posts if it is a parent post
        if not post.parent_post:
            child_posts = Post.objects.filter(parent_post=post_id)
            for child_post in child_posts:
                child_post.delete()

        post.delete()
        return HttpResponse("Post Success")


# Save Post
def savePost(request):
    ''' -- Function-based View for save a post instead of the chat server. '''

    if request.method == 'POST':
        postuser = request.user
        textcontent = request.POST.get("text", '')
        # activity to assign post to
        activityType = request.POST.get("activity_type", '')
        activityID = request.POST.get("activity_id", '')
        #  validation and save
        if len(textcontent) > 0:
            mess = Post(text=textcontent)
            mess.creator = postuser
        if request.POST.get('parent_post', '') != '':
            mess.parent_post = request.POST.get('parent_post', '')
        if request.POST.get('audio_URL', '') != '':
            mess.audio_URL = request.POST.get('audio', '')
        mess.save()
        #  save mess with that activity
        if activityType == 'discussion':
            activity = DiscussionActivity.objects.filter(id=activityID)[0]
            activity.posts.add(mess)
        if activityType == 'essay':
            essayResponse = EssayResponse.objects.filter(id= activityID)[0]
            essayResponse.posts.add(mess)
            private_users = essayResponse.essay_activity.collection.get_private_users()
            context = {
                "post": mess,
                "private_users": private_users,
            }
            return render_to_response('essay_response_comment.html', context)

    return HttpResponse("Post Success")


def fileUpload(request):
    ''' -- Function-based View for saving a file. '''

    response = {'files': []}
    # Loop through our files in the files list
    for singleFile in request.FILES.getlist('file'):
        # Create a new entry in our database
        new_file = Document(file_upload=singleFile)
        new_file.save()
        # Grab the file
        obj = getattr(new_file, "file_upload")
        # Save output for return as JSON
        response['files'].append({
            'name': '%s' % singleFile.name,
            'size': '%s' % singleFile.size,
            'url': '%s' % obj.url,
            # 'deleteUrl': '\/file\/delete\/%s' % obj.name,
            # 'deleteType': 'DELETE'
        })

    return HttpResponse(json.dumps(response), content_type='application/json')

# subscribe to a course:
@login_required
def subscribeCourse(request, accesskey):
    ''' -- Function-based view for user to subscribe a course '''

    courseToSubscribe = get_object_or_404(ActivityCollection, 
        accesscode=accesskey,
        is_deleted=False,
    )
    assign_perm('core.view_course', request.user , courseToSubscribe)

    return  redirect(courseToSubscribe)

# duplicate a course:
@login_required
def CourseCopyView(request, course_id):
    ''' -- Function-based view for copying a course and its whole structure. '''

    # copy course
    courseToCopy = get_object_or_404(ActivityCollection, pk=course_id)
    lessonsToCopy = courseToCopy.lesson_set.all()
    activitiesToCopy = list(chain(courseToCopy.discussions.all(),courseToCopy.essays.all(),courseToCopy.overdubs.all()))
    courseToCopy.pk = None
    # courseToCopy.accesscode = courseToCopy.accesscode
    courseToCopy.is_active = False
    # deal with unique title
    time = datetime.now()
    timeStamp = str(time.month)+"/"+str(time.day)+"/"+str(time.year)+" "+str(time.hour)+":"+str(time.minute)+":"+str(time.second)
    try:
        courseToCopy.title = courseToCopy.title+"("+timeStamp+")"
    except:
        return HttpResponse('copy failed when saving course title') 
    # deal with unique accesscode
    try:
        courseToCopy.accesscode = courseToCopy.accesscode+"("+timeStamp+")"
    except:
        return HttpResponse('copy failed when saving course accesscode')
    courseToCopy.save()
    assign_perm('core.edit_course', request.user, courseToCopy)
    # copy course lessons
    for lessonToCopy in lessonsToCopy:
        lessonToCopy.pk = None
        lessonToCopy.collection = courseToCopy
        lessonToCopy.save()
    # copy course activities
    for activityToCopy in activitiesToCopy:
        lessonsToAdd = activityToCopy.lesson
        activityToCopy.pk=None
        activityToCopy.collection = courseToCopy
        activityToCopy.save()
        activityToCopy.posts.clear()
        if lessonsToAdd.count() != 0:
            for l in lessonsToAdd.all():
                activityToCopy.lesson.add(courseToCopy.lesson_set.filter( title = l.title )[0])
    
    return  redirect(courseToCopy)

# change user object permission
@login_required
def changePerm(request):
    ''' -- Function-based view to perform permission control in an Activity. '''

    if request.method == 'POST':
        request_user = request.user
        user_name = request.POST.get("object_username", '')
        try:
            perm_user = User.objects.get(username=user_name)
        except:
            pass
        perm_codename = request.POST.get("codename", '')
        perm_object_type = request.POST.get("object_type", '')
        perm_object_id = request.POST.get("object_id", '')
        perm_operation_type = request.POST.get("operation_type", '')
        #  validation and change perm

        try:
            if perm_object_type == 'course':
                target_object = ActivityCollection.objects.filter(id=perm_object_id)[0]
            elif perm_object_type == 'discussion':
                target_object = DiscussionActivity.objects.filter(id=perm_object_id)[0]
            elif perm_object_type == 'essay':
                target_object = EssayActivity.objects.filter(id=perm_object_id)[0]
            elif perm_object_type == 'overdub':
                target_object = OverdubActivity.objects.filter(id=perm_object_id)[0]
            else:
                return HttpResponse('wrong object type')
        except:
            return HttpResponse('no such object')
        if perm_operation_type == 'assign_perm':
            assign_perm(perm_codename, perm_user, target_object)
            return HttpResponse('successful change')
        elif perm_operation_type == 'remove_perm':
            remove_perm(perm_codename, perm_user, target_object) 
            return HttpResponse('successful change')
        elif perm_operation_type == 'enable_control':
            target_object.permission_control = True
            target_object.save()
            return HttpResponse('successful change')
        elif perm_operation_type == 'disable_control':
            target_object.permission_control = False
            target_object.save()
            return HttpResponse('successful change')
        else:
            return HttpResponse('no change')
    else:
        return HttpResponse('post ajax required') 

# copy activity
@login_required
def copyActivity(request):
    ''' -- Function-based view to copy an activity to some course '''

    if request.method == 'POST':
        request_user = request.user
        activity_object_type = request.POST.get("activity_type", '')
        activity_object_id = request.POST.get("activity_id", '')
        activity_copy_coursename = request.POST.get("course_name", '')
        activity_copy_courseid = request.POST.get("course_id", '')
        #  validation and change perm
        try:
            course_to_attach = ActivityCollection.objects.filter(id=activity_copy_courseid)[0]
        except:
            return("No such course")
        try:
            if activity_object_type == 'discussion':
                target_object = DiscussionActivity.objects.filter(id=activity_object_id)[0]
            elif activity_object_type == 'essay':
                target_object = EssayActivity.objects.filter(id=activity_object_id)[0]
            elif activity_object_type == 'overdub':
                target_object = OverdubActivity.objects.filter(id=activity_object_id)[0]
            else:
                return HttpResponse('wrong object type')
        except:
            return HttpResponse('no such object')
        target_object.pk=None
        time = datetime.now()
        timeStamp = str(time.month)+"/"+str(time.day)+"/"+str(time.year)+" "+str(time.hour)+":"+str(time.minute)+":"+str(time.second)
        target_object.title= target_object.title+"("+timeStamp+")"
        target_object.collection=course_to_attach
        target_object.is_active = False
        target_object.save()
        target_object.posts.clear()
        target_object.lesson.clear()
        return HttpResponse("success_redirect"+course_to_attach.get_absolute_url())
    else:
        return HttpResponse('post ajax required') 

# change lesson title
@login_required
def editLessonTitle(request):
    ''' -- Function-based view for editing lesson title on the fly. '''

    if request.method == 'POST':
        lesson_id = request.POST.get("pk", '')
        new_title = request.POST.get("value", '')
        try:
            target_lesson = Lesson.objects.filter(id=lesson_id)[0]
            target_lesson.title = new_title
            target_lesson.save()
            return HttpResponse('Success') 
        except:
            return HttpResponseBadRequest()

# process essay draft
@login_required
def editEssayDraft(request):
    ''' -- Function-based view to save the edition of an Essay Draft. '''
 
    if request.method == 'POST':
        operation = request.POST.get("operation", '')
        essay_id = request.POST.get("essay_id", '')
        draft_title = request.POST.get("draft_title", '')
        current_user = request.user
        # draft_number = request.POST.get("draft_number", '')
        # draft_status = request.POST.get("draft_status", '')
        draft_content = request.POST.get("draft_content", '')
        progressing_response = EssayResponse.objects.filter(user=request.user, essay_activity__id=essay_id, status='in progress').order_by('modified','-draft_number')
        # There is an exiting essay response
        if progressing_response.count() == 1: 
            target_object = progressing_response[0]
            target_object.draft_title = draft_title
            target_object.draft = draft_content
            if operation == 'save':
                pass
            elif operation == 'submit':
                target_object.status = 'submitted'
            target_object.save()
            return HttpResponse('Success')
        # There is not an exiting essay response
        elif progressing_response.count() == 0 : 
            new_draft_number = EssayResponse.objects.filter(user=request.user, essay_activity__id=essay_id).count()+1
            target_object = EssayResponse(essay_activity=get_object_or_404(EssayActivity, pk=essay_id), draft_title=draft_title, user= request.user,draft_number=new_draft_number,draft=draft_content)
            if operation == 'save':
                target_object.status='in progress'
            elif operation == 'submit':
                # check this does not go over # of required_revisions
                target_object.status='submitted'
            else:
                pass
            target_object.save()
            return HttpResponse('Success')
        else:
            return HttpResponseBadRequest()

def uhcaslogout(request):
    from django.contrib.auth import logout
    logout(request)
    logouturl = urljoin(settings.CAS_SERVER_URL, 'logout')
    protocol = ('http://', 'https://')[request.is_secure()]
    host = request.get_host()
    logouturl += '?' + urlencode({'service': protocol + host })
    
    return HttpResponseRedirect(logouturl)

