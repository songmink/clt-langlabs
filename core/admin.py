from django.contrib import admin

from core.models import ActivityCollection
from core.models import Post, Document
from core.models import Lesson
from discussions.models import DiscussionActivity
from overdub_discussions.models import OverdubActivity
from essays.models import EssayActivity, EssayResponse

class ActivityCollectionAdmin(admin.ModelAdmin):
	save_as = True

class DiscussionActivityAdmin(admin.ModelAdmin):
	save_as = True

class OverdubActivityAdmin(admin.ModelAdmin):
	save_as = True

admin.site.register(ActivityCollection, ActivityCollectionAdmin)
admin.site.register(Lesson)
admin.site.register(Post)
admin.site.register(Document)
admin.site.register(EssayResponse)
admin.site.register(DiscussionActivity, DiscussionActivityAdmin)
admin.site.register(OverdubActivity, OverdubActivityAdmin)
admin.site.register(EssayActivity)
