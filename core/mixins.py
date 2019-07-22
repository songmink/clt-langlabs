# mixins.py
from itertools import chain
from operator import attrgetter
from copy import deepcopy
from datetime import datetime
from collections import OrderedDict

from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect

from guardian.shortcuts import get_objects_for_user, get_users_with_perms, get_perms

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from essays.models import EssayResponse

from cltlanglab.settings import base
from django.conf import settings

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
            for user, perms in anyperm.items():
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
        for user, perms in anyperm.items():
            if permission in perms:
                result = chain(result, User.objects.filter(username=user))

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


class ActivityEditPermissionMixin(object):
    ''' -- ActivityEditPermissionMixin checks current user's permission to update or delete an activity in a course, and provides screening. '''

    def get_object(self, queryset=None):
        '''  :returns: "Permission Denied" page if user is a not an Instructor of the course. '''

        obj = super(ActivityEditPermissionMixin, self).get_object(queryset)
        if not self.request.user.has_perm("core.edit_course", obj.collection):
            raise PermissionDenied()
        return obj


class ActivityViewPermissionMixin(object):
    ''' -- ActivityViewPermissionMixin checks current user's permission to view an activity, and provides screening. '''

    def get_object(self, queryset=None):
        '''  :returns: "Permission Denied" page if the course/activity is inactive OR deleted AND the user is not an instructor, OR if user is not a member of the course, OR if svtivity membership is on AND the user is not a member. '''

        activity = super(ActivityViewPermissionMixin, self).get_object(queryset)
        course = activity.collection
        user = self.request.user
        # if course is inactive or deleted and user doesn't have edit_course
        # perm, then raise 403
        if not course.is_active or course.is_deleted:
            if not user.has_perm("core.edit_course", course):
                raise PermissionDenied()

        # if activity is inactive or deleted and user doesn't have edit_course
        # perm, then raise 403
        if not activity.is_active or activity.is_deleted:
            if not user.has_perm("core.edit_course", course):
                raise PermissionDenied()

        # if user is not an instructor check the following:
        # if activity membership is on, check if user can view_activity. Otherwise
        # just check if user can course_view.
        if not user.has_perm('edit_course', course):
            if activity.permission_control == True:
                print (get_perms(user, course))
                print (get_perms(user, activity))
                if not user.has_perm("view_activity", activity):
                    raise PermissionDenied()
            else:
                if not get_perms(user, course):
                    raise PermissionDenied()

        return activity


class ActivityListMixin(object):
    ''' -- ActivityListMixin extracts all activities related to current course. '''

    def get_context_data(self, **kwargs):
        '''  :returns:  Activitylist for navigation bar and page body. '''

        context = super(ActivityListMixin, self).get_context_data(**kwargs)

        try:  # in activity index view?
            course = self.get_object().collection

        except:  # in course detail view?
            course = self.get_object()

        # Retrieve all lessons associated with course.
        lessons = course.lesson_set.all().order_by('display_order')

        # Initialize a data structure for representing lessons and activities
        lessondict = OrderedDict()
        for lesson in lessons:
            lessondict[lesson.id] = (lesson, [])

        # Gather activities associated with this course.
        activities = (list(course.discussions.all().filter(is_deleted=False).order_by('display_order'))
            + list(course.essays.all().filter(is_deleted=False).order_by('display_order'))
            + list(course.overdubs.all().filter(is_deleted=False).order_by('display_order'))
            + list(course.flatpages.all().filter(is_deleted=False).order_by('display_order'))
            )
        activities.sort(key=lambda x: x.display_order, reverse=False)

        # Map each activity to its lesson
        orphan_activities = []
        for activity in activities:
            activitylessons = activity.lesson.all()
            if activitylessons:
                for lesson in activitylessons:
                    lessondict[lesson.id][1].append(activity)
            else:
                orphan_activities.append(activity)

        menu_listing = []
        for i, j in lessondict.items():
            for k in j[1]:
                menu_listing.append(k)


        context['course'] = course
        context['activity_list_course'] = lessondict
        context['activity_list'] = menu_listing + orphan_activities
        context['orphan_list'] = orphan_activities
        context['orphan_num'] = len(orphan_activities)

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

class PostsListMixin(object):
    ''' --PostsListMixin used to filter non-deleted activity posts. '''

    def get_context_data(self, **kwargs):
        ''' :returns: context that contains activity posts. '''

        context = super(PostsListMixin, self).get_context_data(**kwargs)
        context['posts'] = self.get_object().posts.filter(is_deleted=False)

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
