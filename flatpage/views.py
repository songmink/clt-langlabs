from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView, View
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django import forms
from braces.views import LoginRequiredMixin, CsrfExemptMixin, JSONResponseMixin, AjaxResponseMixin
from core.models import ActivityCollection, AbstractActivity, Post, Lesson, Document
from core.mixins import CourseListMixin, ActivityListMixin, CreateActivityMixin, RecorderMixin, CreateActivity4UpdateMixin, UsersWithPermsMixin, ActivityEditPermissionMixin, ActivityViewPermissionMixin, UserPostNumMixin, FakeDeleteMixin, ChatServerMixin, PostsListMixin
from .models import FlatpageActivity
import json
# Create your views here.
class FlatpageDetailView(ActivityViewPermissionMixin, CourseListMixin, ActivityListMixin, UsersWithPermsMixin, DetailView):
    ''' -- Flatpage Detail Page '''

    model = FlatpageActivity
    context_object_name = 'activity'
    template_name = 'flatpage.html'


class FlatpageCreateView(CourseListMixin, CreateActivityMixin, CreateView):
    ''' -- Flatpage Create Page '''

    model = FlatpageActivity
    template_name = 'activity_create.html'
    fields = ['title', 'content', 'lesson', 'is_active', 'display_order']
    activity_type = 'flatpage'

    def get_form(self, form_class):
        form = super(FlatpageCreateView, self).get_form(form_class) 
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.kwargs['pk']))
        form.fields['content'] = forms.CharField(widget = forms.Textarea(attrs={'id':'flatpageTextarea', 'rows': 20}))
        return form

    def form_valid(self, form):
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        form.instance.activity_type = self.activity_type
        self.object = form.save()
        flatpage = FlatpageActivity.objects.get(slug = self.object.slug)
        attachments = self.request.POST.getlist('attachments');
        try:
            for attachment in attachments:
                document = Document.objects.get(accessURL = attachment)
                document.content_object = flatpage
                document.save()
        except:
            pass
        return HttpResponseRedirect(self.get_success_url())

class FlatpageUpdateView(ActivityEditPermissionMixin, CourseListMixin, CreateActivity4UpdateMixin, UpdateView):
    ''' -- Flatpage Edit Page '''

    model= FlatpageActivity
    context_object_name = 'activity'
    template_name = 'activity_edit.html'
    fields = ['title', 'content', 'lesson', 'is_active', 'display_order']
    activity_type = 'flatpage'

    def get_form(self, form_class):
        form = super(FlatpageUpdateView, self).get_form(
            form_class)  
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.object.collection.id))
        form.fields['content'] = forms.CharField(widget = forms.Textarea(attrs={'id':'flatpageTextarea', 'rows': 20}))
        return form

    def form_valid(self, form):
        self.object = form.save()
        flatpage = FlatpageActivity.objects.get(slug = self.object.slug)
        attachments = self.request.POST.getlist('attachments');
        try:
            for attachment in attachments:
                document = Document.objects.get(accessURL = attachment)
                document.content_object = flatpage
                document.save()
        except:
            pass
        return HttpResponseRedirect(self.get_success_url())

class FlatpageDeleteView(ActivityEditPermissionMixin, CourseListMixin, FakeDeleteMixin, DeleteView):
    ''' -- Flatpage Delete Confirmation Page '''

    model = FlatpageActivity
    template_name = 'activity_delete.html'

def deleteAttachment(request):
    ''' -- Function-based View for deleting an attachment. '''

    document_accessURL = request.POST.get("document_accessURL")
    print(document_accessURL)
    document = Document.objects.get(accessURL=document_accessURL)
    document.delete()
    response = {'success': True}

    return HttpResponse(json.dumps(response), content_type='application/json')
