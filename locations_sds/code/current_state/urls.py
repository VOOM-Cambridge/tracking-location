from django.urls import path,include
from rest_framework import routers
from . import views
from django.shortcuts import redirect

def redirect_root(request):
    response = redirect('jobs/')
    return response

router = routers.DefaultRouter()
router.register(r'jobs',views.GetState,basename='jobs')
router.register(r'locations',views.Locations)
router.register(r'^location/(?P<location>\w+)',views.StateAtLocation,basename='location')

urlpatterns= [ path('',redirect_root) ] + router.urls

