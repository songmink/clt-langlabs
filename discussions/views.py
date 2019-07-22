# discussions/views.py

from django.core.exceptions import ImproperlyConfigured

from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.forms import ModelChoiceField
from django.urls import reverse_lazy

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from core.mixins import CourseListMixin, ActivityListMixin, CreateActivityMixin, CreateActivity4UpdateMixin, UsersWithPermsMixin, ActivityEditPermissionMixin, ActivityViewPermissionMixin, UserPostNumMixin, FakeDeleteMixin, PostsListMixin

from django.utils.safestring import mark_safe
import json

from .models import DiscussionActivity


class DiscussionDetailView(ActivityViewPermissionMixin, CourseListMixin, ActivityListMixin, UsersWithPermsMixin, UserPostNumMixin, PostsListMixin, DetailView):
    ''' -- Discussion Detail Page '''

    model = DiscussionActivity
    context_object_name = 'activity'
    template_name = 'discussion.html'


class DiscussionCreateView(CourseListMixin, CreateActivityMixin, CreateView):
    ''' -- Discussion Create Page '''

    model = DiscussionActivity
    template_name = 'activity_create.html'
    fields = ['title', 'instructions',
              'lesson', 'is_active', 'read_after_post', 'private_mode', 'display_order']
    activity_type = 'discussion'

    def get_form(self, form_class=None):
        ''' :returns: A list of lessons the course has into *"form"*. '''

        form = super(DiscussionCreateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.kwargs['pk']))
        return form

    def form_valid(self, form):
        # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        form.instance.activity_type = self.activity_type
        return super(DiscussionCreateView, self).form_valid(form)

class DiscussionUpdateView(ActivityEditPermissionMixin, CourseListMixin, CreateActivity4UpdateMixin, UpdateView):
    ''' -- Discussion Edit Page '''

    model=DiscussionActivity
    context_object_name = 'activity'
    template_name = 'activity_edit.html'
    fields = ['title', 'instructions',
              'lesson', 'is_active', 'read_after_post', 'private_mode', 'display_order']
    activity_type = 'discussion'

    def get_form(self, form_class=None):
        ''' :returns: A list of lessons the course has into *"form"*. '''

        form = super(DiscussionUpdateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.object.collection.id))
        return form

class DiscussionDeleteView(ActivityEditPermissionMixin, CourseListMixin, FakeDeleteMixin, DeleteView):
    ''' -- Discussion Delete Confirmation Page '''

    model = DiscussionActivity
    # success_url = 'ToBeReplaced'
    template_name = 'activity_delete.html'

    def get_success_url(self):
        if self.success_url:
            return self.success_url % self.object.__dict__
        else:
            raise ImproperlyConfigured(
                "No URL to redirect to. Provide a success_url.")

