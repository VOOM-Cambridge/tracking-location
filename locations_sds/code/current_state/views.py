from django.shortcuts import render
from django.conf import settings
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from datetime import datetime, timedelta
from .models import JobState, Location
from .serializers import JobStateSerializer, LocationSerializer
from django.views.decorators.clickjacking import xframe_options_exempt


class GetState(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobStateSerializer

    @xframe_options_exempt
    def get_queryset(self):
        # Delete old entries in complete
        # This is not ideal - it should be replaced by a cron job for long running systems
        # but should be ok for small deployments
        if settings.DELETE_ON_COMPLETE:
            today = datetime.combine(datetime.today(),datetime.min.time())
            threshold = today - settings.DELETE_THRESHOLD + timedelta(days=1)
            JobState.objects.filter(location__name__exact="Complete").filter(timestamp__lt=threshold).delete()
        
        return JobState.objects.all()


class Locations(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    
    def get_permissions(self):
        return [IsAuthenticatedOrReadOnly()]

class StateAtLocation(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobStateSerializer
    @xframe_options_exempt
    def get_queryset(self):
        return JobState.objects.filter(location__name=self.kwargs['location'])
