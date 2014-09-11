# core/views.py
import json
from datetime import datetime
from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

from braces.views import LoginRequiredMixin, CsrfExemptMixin
from guardian.shortcuts import assign_perm, remove_perm
from guardian.mixins import PermissionRequiredMixin

from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.views.decorators.csrf import csrf_exempt
from django.core.urlresolvers import reverse_lazy

from core.mixins import CourseListMixin, ActivityListMixin, UsersWithPermsMixin

from .models import AbstractActivity, ActivityCollection, Lesson, Post, Document

from discussions.models import DiscussionActivity
from essays.models import EssayActivity
from overdub_discussions.models import OverdubActivity


class IndexView(TemplateView):
    template_name = 'index.html'


class HomeView(LoginRequiredMixin, CourseListMixin, TemplateView):
    template_name = 'home.html'


class CourseIndexView(LoginRequiredMixin, CourseListMixin, ActivityListMixin, UsersWithPermsMixin, DetailView):
    model = ActivityCollection
    context_object_name = 'course'
    template_name = 'course.html'


class CourseCreateView(LoginRequiredMixin, CourseListMixin, CreateView):
    model = ActivityCollection
    template_name = 'collection_create.html'
    fields = ['title', 'nickname', 'accesscode']

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
    model = ActivityCollection
    template_name = 'collection_edit.html'
    fields = ['title', 'nickname', 'accesscode']
    permission_required = 'core.edit_course'
    raise_exception = True

    def form_valid(self, form):
        form.save()
        assign_perm('core.edit_course', self.request.user, form.instance)
        return super(CourseCreateView, self).form_valid(form)

class CourseDeleteView(LoginRequiredMixin, PermissionRequiredMixin, CourseListMixin, DeleteView):
    model = ActivityCollection
    success_url = reverse_lazy('home')
    template_name = 'activity_delete.html'
    permission_required = 'core.edit_course'
    raise_exception = True


class LessonCreateView(LoginRequiredMixin, CourseListMixin, CreateView):
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
    model = ActivityCollection
    context_object_name = 'course'
    template_name = "activity_create_index.html"


# Used in the iframe when adding lesson on the fly


class LessonAddView(LessonCreateView):
    template_name = 'lesson_create_2.html'

    def form_valid(self, form):
    # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['addpk'])
        return super(LessonAddView, self).form_valid(form)

    def get_success_url(self):
        return self.object.collection.get_absolute_url()

# Save Post


def savePost(request):

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

    return HttpResponse("Post Success")


def fileUpload(request):
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
    courseToSubscribe = get_object_or_404(ActivityCollection, accesscode=accesskey)
    assign_perm('core.view_course', request.user , courseToSubscribe)

    return  redirect(courseToSubscribe)

# change user object permission
@login_required
def changePerm(request):

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














