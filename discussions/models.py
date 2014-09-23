from django.db import models

from core.models import ActivityCollection, AbstractActivity

class DiscussionActivity(AbstractActivity):
	collection = models.ForeignKey(
		ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL, related_name='discussions')
	read_after_post = models.BooleanField(default=False)
	private_mode = models.BooleanField(default=False)

	