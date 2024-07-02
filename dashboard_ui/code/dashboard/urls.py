from django.urls import path,include
from django.shortcuts import redirect

from . import views

def redirect_root(request):
    response = redirect('locations')
    return response

urlpatterns = [
    path('',redirect_root),
    path('locations',views.location_dash,name='locations'),
    path('jobs',views.job_dash,name='jobs'),
        ]

