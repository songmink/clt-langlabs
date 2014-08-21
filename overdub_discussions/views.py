# overdub_discussions/views.py
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView, CreateView
from django.views.generic.edit import FormView, UpdateView, DeleteView
from django.forms import ModelChoiceField
from django import forms

from core.models import ActivityCollection, AbstractActivity, Post, Lesson, Document
from core.mixins import CourseListMixin, ActivityListMixin, CreateActivityMixin, RecorderMixin, CreateActivity4UpdateMixin
from .models import OverdubActivity


# def overdub_detail_view(request, pk):
# 	activity = get_object_or_404(EssayActivity, pk=pk)
	
# 	course = activity.collection
# 	course_list = ActivityCollection.objects.filter()
# 	activity_list = AbstractActivity.objects.filter(collection=course).order_by("display_order")
	
# 	return render(request, 'essay.html', 
# 		{
# 			'activity' : activity,
# 			'course' : course,
# 			'course_list' : course_list,
# 			'activity_list' : activity_list,
# 		})



class OverdubDetailView(CourseListMixin, ActivityListMixin, RecorderMixin,DetailView):
    model = OverdubActivity
    context_object_name = 'activity'
    template_name = 'overdub.html'


class OverdubCreateView(CourseListMixin, CreateActivityMixin, CreateView):
    model = OverdubActivity
    template_name = 'activity_create.html'
    fields = ['title', 'instructions', 'media',
              'lesson', 'is_active', 'read_after_post']
    activity_type = 'overdub'

    def get_form(self, form_class):
        form = super(OverdubCreateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.kwargs['pk']))
        form.fields['media'].label = "Video URL (e.g. http://youtu.be/DJ9zIuFoQ5o)"
        # form.fields['upload_video'].label = "or Upload a Video"
        form.fields.insert(3,'upload_video',forms.FileField(required = False,label='or Upload a Video'))
        # form.fields['upload_video'] = forms.FileField(required = False,label='or Upload a Video')
        # do something like:  form.fields['uploaded_video']=forms.CharField(label = "What is your favorite color?",max_length = 80,required = True)
        return form

    def form_valid(self, form):
        # Auto set the following fields:
        form.instance.collection = get_object_or_404(
            ActivityCollection, pk=self.kwargs['pk'])
        form.instance.activity_type = self.activity_type
        try:
            instance = Document(file_upload = self.request.FILES['upload_video'])
            instance.save()
            if not form.instance.media:
                form.instance.media=instance.accessURL
        except:
            pass

        return super(OverdubCreateView, self).form_valid(form)

class OverdubUpdateView(CourseListMixin, CreateActivity4UpdateMixin, UpdateView):
    model= OverdubActivity
    context_object_name = 'activity' 
    template_name = 'activity_edit.html'
    fields = ['title', 'instructions', 'media',
              'lesson', 'is_active', 'read_after_post']
    activity_type = 'overdub'

    def get_form(self, form_class):
        form = super(OverdubUpdateView, self).get_form(
            form_class)  # instantiate using parent
        form.fields['lesson'].queryset = Lesson.objects.filter(
            collection=get_object_or_404(ActivityCollection, pk=self.object.lesson.collection.id))
        form.fields['media'].label = "Video URL (e.g. http://youtu.be/DJ9zIuFoQ5o)"
        form.fields.insert(3,'upload_video',forms.FileField(required = False,label='or Upload a Video'))

        return form
    
    def form_valid(self, form):
        try:
            instance = Document(file_upload = self.request.FILES['upload_video'])
            instance.save()
            if not form.instance.media:
                form.instance.media=instance.accessURL
        except:
            pass

        return super(OverdubUpdateView, self).form_valid(form)

