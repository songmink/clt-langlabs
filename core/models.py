from django.db import models
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
import os

ACTIVITY_TYPES = (
    ('DiscussionActivity',  'Discussion Activity'),
    ('EssayActivity',       'Essay Activity'),
    ('OverdubActivity',     'Overdub Media Activity'),
)


class ActivityCollection(models.Model):
    title = models.CharField(max_length=100, unique=True)
    nickname = models.CharField(max_length=100)
    membership = models.ManyToManyField(User)

    def get_absolute_url(self):
        return reverse('course', args=[str(self.id)])

    def __unicode__(self):
        return self.title + " (" + self.nickname + ")"


class Lesson(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    display_order = models.IntegerField(default=0)
    collection = models.ForeignKey(
        ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL)

    def get_absolute_url(self):
        return reverse('lesson', args=[str(self.id)])

    def __unicode__(self):
        return self.title


class Post(models.Model):
    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True, null=True)
    creator = models.ForeignKey(User)
    parent_post = models.ForeignKey('self', blank=True, null=True)
    audio_URL = models.URLField(max_length=200, blank=True, null=True)

    def get_absolute_url(self):
        return reverse('post', args=[str(self.id)])

    def __unicode__(self):
        return self.text
    
    # used to obtain the attached documents for the post
    def get_documents(self):
        return Document.objects.filter(post=self)


class AbstractActivity(models.Model):
    DISCUSSION = 'discussion'
    ESSAY = 'essay'
    OVERDUB = 'overdub'
    ACTIVITY_TYPES = (
        (DISCUSSION,  'Discussion Activity'),
        (ESSAY,       'Essay Activity'),
        (OVERDUB,     'Overdub Media Activity'),
    )

    title = models.CharField(max_length=100)
    instructions = models.TextField()
    lesson = models.ForeignKey(
        Lesson, blank=True, null=True, on_delete=models.SET_NULL)
    display_order = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True, null=True)
    modified = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)
    activity_type = models.CharField(
        max_length=100, choices=ACTIVITY_TYPES, default=DISCUSSION)
    posts = models.ManyToManyField(Post, null=True, blank=True)

    def get_siblings(self):
        return self.objects.filter(collection=self.collection).order_by("display_order")

    def get_absolute_url(self):
        return reverse(self.activity_type, args=[str(self.id)])

    def __unicode__(self):
        return self.title

    class Meta:
        abstract = True


class Document(models.Model):
    file_upload = models.FileField(
        upload_to='documents', null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
    post = models.ForeignKey(Post, null=True, blank=True)
    # This is a url field used to filter objects
    accessURL = models.URLField(max_length=200, blank=True, null=True)


    def get_absolute_url(self):
        return self.file_upload.url

    def __unicode__(self):
        return os.path.basename(self.file_upload.name)

    def save(self, *args, **kwargs):
        # has to save first to make the accessURL appear right
        super(Document, self).save(*args, **kwargs)
        self.accessURL = self.file_upload.url
        super(Document, self).save(*args, **kwargs)