# mixins.py
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from itertools import chain
from operator import attrgetter

from core.models import ActivityCollection, AbstractActivity, Post, Lesson

from cltlanglab.settings import base

class CourseListMixin(object):

    def get_context_data(self, **kwargs):
        context = super(CourseListMixin, self).get_context_data(**kwargs)
        try:
            context['course_list'] = get_objects_for_user(self.request.user, ['core.view_course', 'core.edit_course'], any_perm=True)
        except:
            pass
        return context

class UsersWithPermsMixin(object):

    def get_context_data(self, **kwargs):

        context = super(UsersWithPermsMixin, self).get_context_data(**kwargs)
        try:
            # for activity detail view
            context['object_course_users'] = get_users_with_perms( self.get_object().collection,  attach_perms=True, with_superusers=False)
            context['object_users'] = get_users_with_perms( self.get_object(),  attach_perms=False, with_superusers=False)  
            # get private message users for activity detail view
            anyperm = get_users_with_perms(self.get_object().collection , attach_perms=True, with_superusers=False)
            result = User.objects.filter(is_superuser=True).all()
            for user, perms in anyperm.iteritems():
                if 'edit_course' in perms: 
                    result=chain(result, User.objects.filter(username=user))
            result = list(result)
            context['private_users'] = result     
        except:
            # for course detail view
            context['object_users'] = get_users_with_perms( self.get_object(),  attach_perms=True, with_superusers=False)
        return context

    def get_users_with_perm(self, permission):
        '''
        Returns list of users(worn:not QuerySet) with specific permission for this object
        :param permission: permission string
        '''
        anyperm = get_users_with_perms(self.get_object().collection , attach_perms=True, with_superusers=False)
        result = User.objects.filter(is_superuser=True).all()
        print 'super users are:'
        print result
        for user, perms in anyperm.iteritems():
            print permission
            print perms
            print result
            if permission in perms: 
                print 'old result is:'
                print result
                result=chain(result, User.objects.filter(username=user))
                print User.objects.filter(username=user)
                print 'yes and new result is'
                print list(result)
            else:
                print 'no'

        result = list(result)
        
        return result

class UserPostNumMixin(object):

    def get_context_data(self, **kwargs):
        context = super(UserPostNumMixin, self).get_context_data(**kwargs)
        context['user_post_num'] = self.get_object().posts.filter(creator=self.request.user).count()

        return context

class ActivityPermsMixin(object):

    def get_object(self, queryset=None):
        obj = super(ActivityPermsMixin, self).get_object(queryset)
        if (not self.request.user.has_perm("core.edit_course", obj.lesson.collection)) & (not obj.lesson.collection.is_active):
            raise PermissionDenied()
        return obj

class ActivityListMixin(object):

    def get_context_data(self, **kwargs):
        context = super(ActivityListMixin, self).get_context_data(**kwargs)

        try:  # in activity index view?
            course = self.get_object().collection

        except:  # in course detail view?
            course = self.get_object()

        nodes = [
            course.discussions.all(),
            course.essays.all(),
            course.overdubs.all(),
            # Add new types here...
        ]

        acts = ''
        act_orphans = ''

        # Activities associated with lessons...
        for i in nodes:
            acts = chain(acts, i.filter(lesson__isnull=False))

        # Orphans - Activities NOT associated with lessons
        for i in nodes:
            act_orphans = chain(act_orphans, i.filter(lesson__isnull=True))

        # Sort the activities list by lesson display order then by activity
        # display order
        acts = sorted(acts, key=attrgetter(
            'lesson.display_order', 'display_order'))
        
        context['course'] = course
        context['activity_list'] = acts
        context['orphan_list'] = act_orphans

        # determine if we are generating list from an activity object context (self.object) or from a course object using view arguments (pk)
      # try:# in activity index view
            # key = self.object.collection
            # context['course'] = self.object.collection
            # context['activity_list'] = AbstractActivity.objects.filter(collection=key).order_by("lesson__id","display_order")
      # except: # in course detail view
      #     key = self.kwargs['pk']
      #     context['activity_list'] = AbstractActivity.objects.filter(collection=key).order_by("lesson__id","display_order")
        return context


class CreateActivityMixin(object):

    def get_context_data(self, **kwargs):
        context = super(CreateActivityMixin, self).get_context_data(**kwargs)
        context['activity_type'] = self.activity_type
        context['course'] = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        # Feed an lesson Adding Form context to activity_create view
        # context['lessonForm'] = LessonForm()
        return context

class CreateActivity4UpdateMixin(object):

    def get_context_data(self, **kwargs):
        context = super(CreateActivity4UpdateMixin, self).get_context_data(**kwargs)
        context['activity_type'] = self.activity_type
        context['course'] = get_object_or_404(
            ActivityCollection, pk=self.object.lesson.collection.id)
        return context

class RecorderMixin(object):

    def get_context_data(self, **kwargs):
        context = super(RecorderMixin, self).get_context_data(**kwargs)
        context['recorder_myServer'] = base.recorder_myServer
        context['recorder_myHandler'] = base.recorder_myHandler
        context['recorder_myDirectory'] = base.recorder_myDirectory
        print 'my server is : '+context['recorder_myServer']
        return context