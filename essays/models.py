from django.db import models
from django.contrib.auth.models import User

from core.models import ActivityCollection, AbstractActivity, Post

class EssayActivity(AbstractActivity):
	collection = models.ForeignKey(
		ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL, related_name='essays')

	required_revisions = models.IntegerField()

class EssayResponse(models.Model):
	essay_activity = models.ForeignKey(EssayActivity)
	draft_title = models.CharField(max_length=200 , default = 'default_draft_title')
	user = models.ForeignKey(User, blank=True, null= True, related_name='authored_essay_drafts')
	draft_number = models.IntegerField(default=1)
	status = models.CharField(max_length=100 , default='in progress')
	modified = models.DateTimeField(auto_now=True, null=True)
	draft = models.TextField(blank=True, null=True)
	review = models.TextField(blank=True, null=True)
	reviewed_by = models.ForeignKey(User, blank=True, null=True, related_name='reviewed_essay_drafts')
	flagged = models.BooleanField(default=False, blank=True)
	posts = models.ManyToManyField(Post, null=True, blank=True)

	def __unicode__(self):
		return self.draft_title