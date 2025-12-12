# auth_app/urls.py CORRIGÉ
from django.urls import path
from . import views

urlpatterns = [
    # Routes que le proxy envoie
    path('api/register/', views.RegisterView.as_view(), name='api_register'),  # AJOUTÉ
    path('api/login/', views.LoginView.as_view(), name='api_login'),          # AJOUTÉ
    
    # Routes standards
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('refresh/', views.RefreshView.as_view(), name='refresh'),
    path('validate/', views.ValidateView.as_view(), name='validate'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]