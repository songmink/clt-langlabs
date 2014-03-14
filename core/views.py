# core/views.py
from django.shortcuts import render, get_object_or_404

from braces.views import LoginRequiredMixin, CsrfExemptMixin

from django.views.generic.base import TemplateView
from django.views.generic.list import ListView
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView

from core.mixins import CourseListMixin, ActivityListMixin

from .models import AbstractActivity, ActivityCollection, Lesson


class IndexView(TemplateView):
    template_name = 'index.html'


class HomeView(LoginRequiredMixin, CourseListMixin, TemplateView):
    template_name = 'home.html'


class CourseIndexView(LoginRequiredMixin, CourseListMixin, ActivityListMixin, DetailView):
    model = ActivityCollection
    context_object_name = 'course'
    template_name = 'course.html'


class CourseCreateView(LoginRequiredMixin, CourseListMixin, CreateView):
    model = ActivityCollection
    template_name = 'collection_create.html'
    fields = ['title', 'nickname']

    def form_valid(self, form):
        newcourse = form.save(commit=False)
        newcourse.save()
        currentUser = self.request.user
        newcourse.membership.add(currentUser)
        form.save_m2m()
        return super(CourseCreateView, self).form_valid(form)


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
