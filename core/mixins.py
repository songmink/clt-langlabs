# mixins.py
from django.shortcuts import render, get_object_or_404
from itertools import chain
from operator import attrgetter

from core.models import ActivityCollection, AbstractActivity, Post, Lesson

from cltlanglab.settings import base

class CourseListMixin(object):

    def get_context_data(self, **kwargs):
        context = super(CourseListMixin, self).get_context_data(**kwargs)
        context['course_list'] = ActivityCollection.objects.filter(
            membership=self.request.user)
        return context


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