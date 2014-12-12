# discussions/views.py

from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.forms import ModelChoiceField
from django.core.urlresolvers import reverse_lazy

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from core.mixins import CourseListMixin, ActivityListMixin, CreateActivityMixin, RecorderMixin, CreateActivity4UpdateMixin, UsersWithPermsMixin, ActivityPermsMixin, UserPostNumMixin, FakeDeleteMixin, ChatServerMixin

from .models import DiscussionActivity


class DiscussionDetailView(CourseListMixin, ActivityListMixin, ChatServerMixin, RecorderMixin, UsersWithPermsMixin, ActivityPermsMixin, UserPostNumMixin, DetailView):
    ''' -- Discussion Detail Page '''

    model = DiscussionActivity
    context_object_name = 'activity'
    template_name = 'discussion.html'


class DiscussionCreateView(CourseListMixin, CreateActivityMixin, CreateView):
    ''' -- Discussion Create Page '''

    model = DiscussionActivity
    template_name = 'activity_create.html'
    fields = ['title', 'instructions',
              'lesson', 'is_active', 'read_after_post', 'private_mode']
    activity_type = 'discussion'

    def get_form(self, form_class):
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

class DiscussionUpdateView(CourseListMixin, CreateActivity4UpdateMixin, ActivityPermsMixin, UpdateView):
    ''' -- Discussion Edit Page '''

    model=DiscussionActivity
    context_object_name = 'activity' 
    template_name = 'activity_edit.html'
    fields = ['title', 'instructions',
              'lesson', 'is_active', 'read_after_post', 'private_mode']
    activity_type = 'discussion'

    def get_form(self, form_class):
        ''' :returns: A list of lessons the course has into *"form"*. '''

        form = super(DiscussionUpdateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.object.collection.id))
        return form

class DiscussionDeleteView(CourseListMixin, FakeDeleteMixin, DeleteView):
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








