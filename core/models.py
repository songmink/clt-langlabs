from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.validators import MinLengthValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from guardian.shortcuts import get_objects_for_user, get_users_with_perms
from itertools import chain

import os

class ActivityCollection(models.Model):
    '''-- ActivityCollection(course) is used to manage lessons and activities .

        :Fields:
            | **title**  -- Title of course.
            | **nickname**   -- Course nickname.
            | **description** -- Description of the course.
            | **accesscode**    -- Code for students to subscribe a course.
            | **is_active**    -- Flag the activation of a course.
            | **is_public**    -- Flag whether this course can be joined by any user.
            | **is_deleted**    -- Flag for soft deletion of current collection/course.
        :Meta:
            | **permissions**   -- Object level permission control("edit_course" -> Instructor ; "view_course" -> Student)

    '''

    title = models.CharField(max_length=100, unique=True)
    nickname = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    accesscode = models.CharField(max_length=255, blank=False, null=True,
                                  unique=True, verbose_name='Access Code', validators=[MinLengthValidator(10)])
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False, blank=True)
    is_deleted = models.BooleanField(default=False, blank=True)
    objects = models.Manager()

    class Meta:
        permissions = (
            ('view_course', 'view course'),
            ('edit_course', 'edit course'),
            ('create_course', 'create course'),
        )

    def get_private_users(self):
        ''' :returns: All users that have "edit_course" permission to this course. '''

        anyperm = get_users_with_perms(
            self, attach_perms=True, with_superusers=False)
        result = ''
        for user, perms in anyperm.items():
            if 'edit_course' in perms:
                result = chain(result, User.objects.filter(username=user))
        result = list(result)
        return result

    def get_user_num(self):
        ''' :returns: Number of all users whoever has any permission to this course. '''

        anyperm = get_users_with_perms(
            self, attach_perms=False, with_superusers=False)
        return len(anyperm)

    def get_absolute_url(self):
        ''' :returns: Absolute URL of the Course. '''

        return reverse('course', args=[str(self.id)])

    def __str__(self):
        return self.title + " (" + self.nickname + ")"

class Lesson(models.Model):
    '''-- Lesson Model is used to manage activities but activities can belong to a collection/course without a lesson associated with it.

        :Fields:
            | **title**  -- Title of a lesson.
            | **description**      -- A description of the lesson.
            | **display_order** -- Display order of a lesson.
            | **collectoin**    -- The collection/course the lesson is under.

    '''

    title = models.CharField(max_length=100)
    description = models.TextField()
    display_order = models.IntegerField(default=0)
    collection = models.ForeignKey(
        ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL)
    objects = models.Manager()

    def get_absolute_url(self):
        return reverse('lesson', args=[str(self.id)])

    def __str__(self):
        return self.title


class Post(models.Model):
    '''-- Post Model is used to manage posts/comments.

        :Fields:
            | **text**  -- Content of a post.
            | **created**      -- Time the post is created.
            | **creator** -- Creator of the post.
            | **parent_post**    -- The parent post of current post if it's a comment or feedback.
            | **audio_URL**    -- The url link to audio files if there is recording attached to it.

    '''

    text = models.TextField()
    created = models.DateTimeField(auto_now_add=True, null=True)
    creator = models.ForeignKey(User,on_delete=models.CASCADE)
    parent_post = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)
    audio_URL = models.URLField(max_length=200, blank=True, null=True)
    is_deleted = models.BooleanField(default=False, blank=True)
    objects = models.Manager()

    def get_absolute_url(self):
        ''' :returns: Absolute URL of a. '''

        return reverse('post', args=[str(self.id)])

    def __str__(self):
        return self.text

    def get_documents(self):
        ''' :returns: Documents that are related to a Post. '''

        # issue_id=issue.id, issue_ct=ContentType.objects.get_for_model(issue)
        return Document.objects.filter(object_id=self.id, content_type=ContentType.objects.get_for_model(self))

class AbstractActivity(models.Model):
    '''-- AbstractActivity is abstract class for *Discussion*, *Essay* and *Overdub*.

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
        :Meta:
            | **abstract**  -- Set class to abstract
            | **permissions**   -- Object level permission control("view_activity" permission is checked when *permission_control* is set to true )

    '''
    DISCUSSION = 'discussion'
    ESSAY = 'essay'
    OVERDUB = 'overdub'
    FLATPAGE = 'flatpage'
    ACTIVITY_TYPES = (
        (DISCUSSION,  'Discussion Activity'),
        (ESSAY,       'Essay Activity'),
        (OVERDUB,     'Overdub Media Activity'),
        (FLATPAGE,    'Flatpage Activity'),
    )

    title = models.CharField(max_length=100)
    instructions = models.TextField()
    lesson = models.ManyToManyField(Lesson, blank=True)
    display_order = models.IntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True, null=True)
    modified = models.DateTimeField(auto_now=True, null=True)
    is_active = models.BooleanField(default=True)
    activity_type = models.CharField(
        max_length=100, choices=ACTIVITY_TYPES, default=DISCUSSION)
    posts = models.ManyToManyField(Post, blank=True)
    permission_control = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False, blank=True)
    objects = models.Manager()

    class Meta:

        abstract = True
        permissions = (
            ('view_activity', 'view activity'),
        )

    def get_siblings(self):
        '''  :returns: Sibling activites of same collection(course). '''

        return self.objects.filter(collection=self.collection).order_by("display_order")

    def get_absolute_url(self):
        ''' :returns: Absolute URL of Document. '''

        return reverse(self.activity_type, args=[str(self.id)])

    def __str__(self):
        return self.title


class Document(models.Model):

    '''-- Document Model is used to manage files in our project.

        :Fields:
            | **file_upload**  -- FileField object to store files.
            | **created**      -- Record created time.
            | **content_type** -- File content types.
            | **accessURL**    -- The url link to files and is created when file is saved.
            | **file_type**    -- The format of the file.

    '''

    # file objects
    file_upload = models.FileField(
        upload_to='documents', null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    # The url link to this file
    accessURL = models.URLField(max_length=200, blank=True, null=True)
    # The file format, such as video, image, or doc.
    file_type = models.CharField(max_length=50, blank=True, null=True)
    objects = models.Manager()

    def get_absolute_url(self):
        ''' :returns: Absolute URL of Document. '''

        return self.file_upload.url

    def __str__(self):
        return os.path.basename(self.file_upload.name)

    def save(self, *args, **kwargs):
        '''  The *file_upload* field has to be saved before saving its URL to *accessURL* '''
        super(Document, self).save(*args, **kwargs)
        self.accessURL = self.file_upload.url
        super(Document, self).save(*args, **kwargs)
