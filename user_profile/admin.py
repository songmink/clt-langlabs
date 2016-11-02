from user_profile.models import UserProfile
from django.contrib import admin

 
# Register your models here.
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ['user',]
    # prepopulated_fields = {"slug": ("user",)}
 
admin.site.register(UserProfile, UserProfileAdmin)
