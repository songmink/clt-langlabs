# essays/views.py
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView

from core.models import ActivityCollection, AbstractActivity, Post, Lesson
from core.mixins import CourseListMixin, ActivityListMixin, CreateActivityMixin
from .models import EssayActivity


class EssayDetailView(CourseListMixin, ActivityListMixin, DetailView):
    model = EssayActivity
    context_object_name = 'activity'
    template_name = 'essay.html'


class EssayCreateView(CourseListMixin, CreateActivityMixin, CreateView):
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
