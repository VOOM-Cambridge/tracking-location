from django.shortcuts import render
from django.conf import settings
import requests
from shoestring_wrapper.wrapper import Wrapper

from django.views.decorators.clickjacking import xframe_options_exempt


@xframe_options_exempt
def location_dash(request):
    
    state = Wrapper.get().request('statedb/state/jobs')
    locations_raw = Wrapper.get().request('statedb/state/locations')
    locations = []
    
    fields_shown = settings.LOC_FIELDS_SHOWN
    field_names = settings.LOC_FIELD_NAMES
    fields = {'shown':fields_shown,'names':field_names}

    for entry in locations_raw:
        locations += [ entry['name'] ]
    
    return render(
            request,
            'locations.html',
            {
                'fields':fields,
                'locations':locations,
                'jobstate':state,
                'sort':'descending' if settings.SORT_ORDER_DESCENDING else 'ascending',
                'show_duration':'true' if settings.SHOW_DURATION else 'false',
                'id_as_link':'true' if settings.ID_AS_LINK else 'false',
                'id_link_template':settings.LINK_TEMPLATE,
            }
        )

@xframe_options_exempt
def job_dash(request):
    state = Wrapper.get().request('statedb/state/jobs')
  
    fields_shown = settings.JOB_FIELDS_SHOWN
    field_names = settings.JOB_FIELD_NAMES
    
    fields = {'shown':fields_shown,'names':field_names}


    return render(
            request,
            'jobs.html',
            {
                'fields':fields,
                'jobstate':state,
                'sort':'descending' if settings.SORT_ORDER_DESCENDING else 'ascending',
                'show_duration':'true' if settings.SHOW_DURATION else 'false',
                'id_as_link':'true' if settings.ID_AS_LINK else 'false',
                'id_link_template':settings.LINK_TEMPLATE,
            }
        )
