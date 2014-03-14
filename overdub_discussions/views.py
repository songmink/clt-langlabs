# overdub_discussions/views.py
from django.shortcuts import render, get_object_or_404

from core.models import ActivityCollection, AbstractActivity, Post
from .models import OverdubActivity

def overdub_detail_view(request, pk):
	activity = get_object_or_404(EssayActivity, pk=pk)
	
	course = activity.collection
	course_list = ActivityCollection.objects.filter()
	activity_list = AbstractActivity.objects.filter(collection=course).order_by("display_order")
	
	return render(request, 'essay.html', 
		{
			'activity' : activity,
			'course' : course,
			'course_list' : course_list,
			'activity_list' : activity_list,
		})
