from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

from core.models import ActivityCollection, AbstractActivity, Post


class EssayActivity(AbstractActivity):

    '''-- EssayActivity is the class for *Essay*.

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
            | **collection**    -- The course that this discussion activity belongs to.
            | **required_revisions**  -- Number of required revisions in an essay assignment
        :Meta:
            | **abstract**  -- Set class to abstract
            | **permissions**   -- Object level permission control("view_activity" permission is checked when *permission_control* is set to true )

    '''
    collection = models.ForeignKey(
        ActivityCollection, blank=True, null=True, on_delete=models.SET_NULL, related_name='essays')
    required_revisions = models.IntegerField(validators=[
        MinValueValidator(1),
        MaxValueValidator(50),         
    ])


class EssayResponse(models.Model):

    '''-- EssayResponse is the class for *Essay Draft*.

        :Fields:
            | **essay_activity**  -- The essay activity that the draft belongs to.
            | **draft_title**  -- Title of draft.
            | **user**  -- User of the draft.
            | **draft_number**  -- Draft number of this draft.
            | **status**  -- Status of the draft(it starts from "in progress" then become "submitted" and later become "graded").
            | **modified**  -- Time of last modification.
            | **draft**  -- Content of the draft.
            | **review**  -- The review of the draft by an Instructor.
            | **reviewed_by**  -- An instructor that reviews the draft.
            | **flagged**  -- Flag for inappropriate contents.
            | **posts**  -- Comments of a draft.

    '''

    essay_activity = models.ForeignKey(EssayActivity, on_delete=models.CASCADE,)
    draft_title = models.CharField(
        max_length=200, default='default_draft_title')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True, related_name='authored_essay_drafts')
    draft_number = models.IntegerField(default=1)
    status = models.CharField(max_length=100, default='in progress')
    modified = models.DateTimeField(auto_now=True, null=True)
    draft = models.TextField(blank=True, null=True)
    review = models.TextField(blank=True, null=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True, related_name='reviewed_essay_drafts')
    flagged = models.BooleanField(default=False, blank=True)
    posts = models.ManyToManyField(Post, blank=True)

    def __str__(self):
        return self.draft_title
