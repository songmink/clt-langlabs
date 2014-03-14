from django.contrib import admin

from core.models import ActivityCollection
from core.models import Post
from core.models import Lesson
from discussions.models import DiscussionActivity
from overdub_discussions.models import OverdubActivity
from essays.models import EssayActivity

class ActivityCollectionAdmin(admin.ModelAdmin):
	save_as = True

class DiscussionActivityAdmin(admin.ModelAdmin):
	save_as = True

admin.site.register(ActivityCollection, ActivityCollectionAdmin)
admin.site.register(Lesson)
admin.site.register(Post)
admin.site.register(DiscussionActivity, DiscussionActivityAdmin)
admin.site.register(OverdubActivity)
admin.site.register(EssayActivity)
