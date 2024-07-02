from django.urls import path,re_path

from . import views

# def redirect_root(request):
#     response = redirect('locations')
#     return response

urlpatterns = [
    path('', views.render_app, name='render'),
    path('input/', views.render_app, name='render'),
    re_path(r'^input/.*', views.render_app, name='render'),
]

