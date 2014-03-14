from django.db import models

from core.models import ActivityCollection, AbstractActivity, Post

class EssayActivity(AbstractActivity):
	collection = models.ForeignKey(
		ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL, related_name='essays')

	required_revisions = models.IntegerField()