# mixins.py
from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from itertools import chain
from operator import attrgetter
from copy import deepcopy
from datetime import datetime

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from essays.models import EssayResponse

from cltlanglab.settings import base


class CourseListMixin(object):
    ''' -- CourseListMixin passes a list of courses that current user has access to.  '''

    def get_context_data(self, **kwargs):
        '''  :returns: A list of courses into *context['course_list']* .'''

        context = super(CourseListMixin, self).get_context_data(**kwargs)
        try:
            context['course_list'] = get_objects_for_user(self.request.user, [
                                                          'core.view_course', 'core.edit_course'], any_perm=True).filter(is_deleted=False)
        except:
            pass
        return context


class FakeDeleteMixin(object):
    ''' -- FakeDeleteMixin performs the soft deletion of a Course or Activity  '''

    def delete(self, request, *args, **kwargs):
        '''  :returns: Append to the name of course or activity a time stamp to mark as deleted. '''

        self.object = self.get_object()
        if not self.success_url:
            self.success_url = self.object.collection.get_absolute_url()
        time = datetime.now()
        timeStamp = str(time.month) + "/" + str(time.day) + "/" + str(time.year) + \
            " " + str(time.hour) + ":" + str(time.minute) + \
            ":" + str(time.second)
        self.object.is_deleted = True
        self.object.title = "(deleted - " + timeStamp + ")" + self.object.title
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())


class UsersWithPermsMixin(object):
    ''' -- UsersWithPermsMixin provides user list with permission in Course Detail View and Activity Detail View.  '''

    def get_context_data(self, **kwargs):
        '''  :returns: Activity users, course users and course instructors in  activity detail view; Course users in course detail view. '''

        context = super(UsersWithPermsMixin, self).get_context_data(**kwargs)
        try:
            # for activity detail view
            context['object_course_users'] = get_users_with_perms(
                self.get_object().collection,  attach_perms=True, with_superusers=False)
            context['object_users'] = get_users_with_perms(
                self.get_object(),  attach_perms=False, with_superusers=False)
            # get private message users for activity detail view
            anyperm = get_users_with_perms(
                self.get_object().collection, attach_perms=True, with_superusers=False)
            result = User.objects.filter(is_superuser=True).all()
            for user, perms in anyperm.iteritems():
                if 'edit_course' in perms:
                    result = chain(result, User.objects.filter(username=user))
            result = list(result)
            context['private_users'] = result
        except:
            # for course detail view
            context['object_users'] = get_users_with_perms(
                self.get_object(),  attach_perms=True, with_superusers=False)
        return context

    def get_users_with_perm(self, permission):

        anyperm = get_users_with_perms(
            self.get_object().collection, attach_perms=True, with_superusers=False)
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
                result = chain(result, User.objects.filter(username=user))
                print User.objects.filter(username=user)
                print 'yes and new result is'
                print list(result)
            else:
                print 'no'

        result = list(result)

        return result


class UserPostNumMixin(object):
    ''' -- UserPostNumMixin gives the number of posts the user has published. '''

    def get_context_data(self, **kwargs):
        '''  :returns: number of posts the user has published into *context['user_post_num']*. '''

        context = super(UserPostNumMixin, self).get_context_data(**kwargs)
        context['user_post_num'] = self.get_object().posts.filter(
            creator=self.request.user).count()

        return context


class ActivityPermsMixin(object):
    ''' -- ActivityPermsMixin checks current user's permission of certain course and provide screening. '''

    def get_object(self, queryset=None):
        '''  :returns: "Permission Denied" page if user is a not an Instrctor and the course is not active or is deleted. '''

        obj = super(ActivityPermsMixin, self).get_object(queryset)
        print obj
        if ((not self.request.user.has_perm("core.edit_course", obj.collection)) and (not obj.collection.is_active)) or (obj.is_deleted):
            raise PermissionDenied()
        return obj


class ActivityListMixin(object):
    ''' -- ActivityListMixin extracts all activities related to current course. '''

    def get_context_data(self, **kwargs):
        '''  :returns:  Activitylist for navigation bar and page body. '''

        context = super(ActivityListMixin, self).get_context_data(**kwargs)

        try:  # in activity index view?
            course = self.get_object().collection

        except:  # in course detail view?
            course = self.get_object()

        nodes = [
            course.discussions.filter(is_deleted=False).all(),
            course.essays.filter(is_deleted=False).all(),
            course.overdubs.filter(is_deleted=False).all(),
            # Add new types here...
        ]

        acts = []
        acts_navi = []
        act_orphans = ''

        # Activities associated with lessons...
        for i in nodes:
            for eachActivity in i:
                print eachActivity.lesson.count()
                if eachActivity.lesson.count() != 0:
                    acts_navi.append(eachActivity)
                    for j in eachActivity.lesson.all():
                        tempActivity = deepcopy(eachActivity)
                        tempActivity.activity_to_lesson = j
                        acts.append(tempActivity)
                        print tempActivity
                        print tempActivity.activity_to_lesson

        # Orphans - Activities NOT associated with lessons
        orphan_num = 0
        for i in nodes:
            act_orphans = chain(act_orphans, i.filter(lesson__isnull=True))
            orphan_num += i.filter(lesson__isnull=True).count()

        # Sort the activities list by lesson display order then by activity
        # display order
        # we may do the sorting as an array
        acts.sort(key=lambda x: x.activity_to_lesson.title, reverse=False)
        acts.sort(
            key=lambda x: x.activity_to_lesson.display_order, reverse=False)
        for i in acts:
            print i.title + ' || ' + i.activity_to_lesson.title + '||' + str(i.activity_to_lesson.id)

        context['course'] = course
        context['activity_list_course'] = acts
        context['activity_list'] = acts_navi
        context['orphan_list'] = act_orphans
        context['orphan_num'] = orphan_num

        return context


class CreateActivityMixin(object):
    ''' -- CreatedActivityMixin is used in CreateView for activities. '''

    def get_context_data(self, **kwargs):
        '''  :returns:  context that contains activity_type and course infomation for new activites. '''

        context = super(CreateActivityMixin, self).get_context_data(**kwargs)
        context['activity_type'] = self.activity_type
        context['course'] = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        # Feed an lesson Adding Form context to activity_create view
        # context['lessonForm'] = LessonForm()
        return context


class CreateActivity4UpdateMixin(object):
    ''' -- CreatedActivityMixin is used in CreateView for activities. '''

    def get_context_data(self, **kwargs):
        ''' :returns: context that contains the information needed to create lesson on the fly in activity edit view.'''

        context = super(
            CreateActivity4UpdateMixin, self).get_context_data(**kwargs)
        context['activity_type'] = self.activity_type
        context['course'] = get_object_or_404(
            ActivityCollection, pk=self.object.collection.id)
        return context


class RecorderMixin(object):
    ''' -- RecorderMixin extracts configuration for recorder. '''

    def get_context_data(self, **kwargs):
        ''' :returns: context that contains recorder configuration. '''

        context = super(RecorderMixin, self).get_context_data(**kwargs)
        context['recorder_myServer'] = base.recorder_myServer
        context['recorder_myHandler'] = base.recorder_myHandler
        context['recorder_myDirectory'] = base.recorder_myDirectory
        print 'my server is : ' + context['recorder_myServer']
        return context


class EssayResponseListMixin(object):
    ''' -- EssayResponseListMixin is used in Essay Detail View to provide information about essay drafts and reviews. '''

    def get_context_data(self, **kwargs):
        ''' :returns: context that contains submitted/progressing/graded drafts. '''

        context = super(
            EssayResponseListMixin, self).get_context_data(**kwargs)
        context['submitted_essay_responses'] = EssayResponse.objects.filter(
            user=self.request.user, essay_activity=self.get_object()).exclude(status='in progress').order_by('-draft_number')
        context['progressing_essay_response'] = EssayResponse.objects.filter(
            user=self.request.user, essay_activity=self.get_object(), status='in progress').order_by('modified', '-draft_number').first()
        context['graded_essay_responses'] = EssayResponse.objects.filter(
            user=self.request.user, essay_activity=self.get_object(), status='graded').order_by('-draft_number')
        context['all_essay_responses'] = EssayResponse.objects.filter(
            essay_activity=self.get_object()).exclude(status='in progress').order_by('user', '-draft_number')

        return context
