# essays/views.py
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.core.urlresolvers import reverse_lazy

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from core.mixins import CourseListMixin, ActivityListMixin, EssayResponseListMixin, CreateActivityMixin, CreateActivity4UpdateMixin, UsersWithPermsMixin, FakeDeleteMixin, ActivityEditPermissionMixin, ActivityViewPermissionMixin
from .models import EssayActivity, EssayResponse


class EssayDetailView(ActivityViewPermissionMixin, CourseListMixin, ActivityListMixin, EssayResponseListMixin, UsersWithPermsMixin, DetailView):
    ''' -- Essay Detail Page '''

    model = EssayActivity
    context_object_name = 'activity'
    template_name = 'essay.html'

class EssayUpdateView(ActivityEditPermissionMixin, CourseListMixin, CreateActivity4UpdateMixin, UpdateView):
    ''' -- Essay Edit Page '''

    model=EssayActivity
    context_object_name = 'activity' 
    template_name = 'activity_edit.html'
    fields = ['title', 'instructions',
              'lesson', 'is_active', 'required_revisions']
    activity_type = 'essay'

    def get_form(self, form_class):
        ''' :returns: A list of lessons the course has into *"form"*. '''

        form = super(EssayUpdateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.object.collection.id))
        return form

class EssayCreateView(ActivityEditPermissionMixin, CourseListMixin, CreateActivityMixin, CreateView):
    " -- Essay Create Page "

    model = EssayActivity
    template_name = 'activity_create.html'
    fields = ['title', 'instructions', 'lesson',
              'is_active', 'required_revisions']
    activity_type = 'essay'

    def get_form(self, form_class):
        form = super(EssayCreateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.kwargs['pk']))
        return form

    def form_valid(self, form):
        # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        form.instance.activity_type = self.activity_type
        return super(EssayCreateView, self).form_valid(form)

class EssayDeleteView(ActivityEditPermissionMixin, CourseListMixin, FakeDeleteMixin, DeleteView):
    ''' -- Essay Delete Confirmation Page '''

    model = EssayActivity
    # success_url = 'ToBeReplaced'
    template_name = 'activity_delete.html'

class EssayResponseUpdateView(CourseListMixin, UpdateView):
    ''' -- Essay Review Page '''

    model = EssayResponse
    context_object_name = 'response'
    template_name = 'essay_grade.html'
    fields = ['draft','review','flagged']

    def form_valid(self, form):
        # Auto set the following fields:
        form.instance.status = 'graded'
        form.instance.reviewed_by = self.request.user
        return super(EssayResponseUpdateView, self).form_valid(form)
    def get_success_url(self):
        return self.object.essay_activity.get_absolute_url()



