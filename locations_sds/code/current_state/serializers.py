from rest_framework import serializers

from .models import JobState, Location

class JobStateSerializer(serializers.ModelSerializer):
    class Meta:
        model=JobState
        fields = ('id','timestamp','location',"user1","user2","user3")
        depth=1

    def to_representation(self, obj):
        rep = super().to_representation(obj)
        rep['location'] = rep['location']['name']
        return rep

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model=Location
        fields = ['name']


