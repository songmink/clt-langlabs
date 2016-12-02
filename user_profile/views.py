from django.core.exceptions import PermissionDenied, ObjectDoesNotExist
from django.http import Http404
from user_profile.models import UserProfile
from core.mixins import CourseListMixin
from braces.views import LoginRequiredMixin
from django.views.generic import DetailView
from django.views.generic.edit import UpdateView
from django import forms

# Create your views here.


class ProfileDetailView(LoginRequiredMixin, CourseListMixin, DetailView):
	''' Profile detail page. '''
        model = UserProfile
        template_name = 'user_profile/profile_detail.html'
        context_object_name = 'profile_instance'

        def get_object(self, queryset=None):
                slug = self.kwargs.get(self.slug_url_kwarg, None)
                if self.request.user.username == slug:
                        obj, created = self.model.objects.get_or_create(user=self.request.user)
                else:
                        try:
                                obj = self.model.objects.get(slug=slug)
                        except ObjectDoesNotExist:
                                raise Http404('Profile Not Found')
                return obj

class ProfileUpdateView(LoginRequiredMixin, CourseListMixin, UpdateView):
	''' Profile edit page. '''
	model = UserProfile
	template_name = 'user_profile/profile_form.html'
	context_object_name = 'profile_instance'
	fields = ['bio', 'image']
	MAX_FILE_SIZE = 1024*1024

	def get_object(self, queryset=None):
		obj = super(ProfileUpdateView, self).get_object(queryset)
		if not self.request.user == obj.user:
			raise PermissionDenied()
		return obj

	def get_form(self, form_class):
		form = super(ProfileUpdateView, self).get_form(form_class)
		form.fields['image'] = forms.ImageField(
			required=False,
			help_text='Maximum image size is 1MB.',
			widget=forms.ClearableFileInput(attrs={'data-max-file-size': self.MAX_FILE_SIZE})
		)
		return form

	def form_valid(self, form):
		try:
			image = clean_image(form)
			form.image = image
			form.save()
		except:
			pass

		return super(ProfileUpdateView, self).form_valid(form)

	def clean_image(self, form):
		image = form.cleaned_data['image']
		if image and image.size > self.MAX_FILE_SIZE:
			raise forms.ValidationError("Image size is limited to 1MB")
		return image
