from django.db import models

from core.models import AbstractActivity

class OverdubActivity(AbstractActivity):
    media = models.URLField()
