from django.contrib import admin
from .models import JobState
from .models import Location
from adminsortable.admin import SortableAdmin
import datetime
import time

class MySortableAdminClass(SortableAdmin):
    """Any admin options you need go here"""
    pass

admin.site.register(Location, MySortableAdminClass)

def move_complete(modeladmin,request,queryset):
    #determine timezone
    __dt = -1 * (time.timezone if (time.localtime().tm_isdst == 0) else time.altzone)
    tz = datetime.timezone(datetime.timedelta(seconds = __dt))
    #generate timestamp with correct timezone
    timestamp = datetime.datetime.now(tz=tz).isoformat()
    queryset.update(location=Location.objects.get(name='Complete'),timestamp=timestamp)
move_complete.short_description="Move to Complete"

class JobAdmin(admin.ModelAdmin):
    list_display = ['id','location','timestamp']
    list_filter = ['location']
    ordering = ['id']
    actions = [move_complete]


admin.site.register(JobState,JobAdmin)
