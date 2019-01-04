# flatpage/models.py

from __future__ import unicode_literals

from django.db import models
from core.models import ActivityCollection, AbstractActivity, Document
from django.db.models.signals import pre_save
from django.utils.text import slugify
from django.contrib.contenttypes.models import ContentType
# Create your models here.
class FlatpageActivity(AbstractActivity):

    '''-- FlatpageActivity is the class for *Flatpage*.

        :Fields:
            | **title**  -- Title of activity.
            | **instructions**   -- Instructions about this activity.
            | **lesson** -- A lesson this activity belongs to, it could be null.
            | **display_order**    -- Display order of activity.
            | **created**    -- Time of creation.
            | **modified**    -- Time of last modification.
            | **is_active**    -- Flag for activation of activity.
            | **activity_type**    -- Type of current activity.
            | **posts**    -- Associated comments/posts.
            | **permission_control**    -- Flag for permission control within an activity.
            | **is_deleted**    -- Flag for soft deletion of current activity.
            | **collection**    -- The course that this activity belongs to.
            | **content**  -- Content in the flatpage. 
	    | **slug**  -- Slug field is created according to the title of activity. Unique is True. 
        :Meta:
            | **abstract**  -- Set class to abstract
            | **permissions**   -- Object level permission control("view_activity" permission is checked when *permission_control* is set to true )

    '''

    collection = models.ForeignKey(
        ActivityCollection, 
        blank=True, null=True, 
        on_delete=models.SET_NULL, 
        related_name='flatpages')
    content = models.TextField()
    slug = models.SlugField(unique=True, allow_unicode=True)
    objects = models.Manager()

    def get_documents(self):
        ''' :returns: Documents that are related to this activity. '''

        return Document.objects.filter(object_id=self.id, content_type=ContentType.objects.get_for_model(self))


def create_slug(instance, new_slug=None):
    slug = slugify(instance.title)
    if new_slug is not None:
        slug = new_slug
    qs = FlatpageActivity.objects.filter(slug=slug).order_by("-id")
    exists = qs.exists()
    if exists:
        new_slug = "%s-%s" %(slug, qs.first().id)
        return create_slug(instance, new_slug=new_slug)
    return slug


def pre_save_post_receiver(sender, instance, *args, **kwargs):
    if not instance.slug:
        instance.slug = create_slug(instance)

pre_save.connect(pre_save_post_receiver, sender=FlatpageActivity)
