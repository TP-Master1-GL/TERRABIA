# auth_app/models.py
from django.db import models
from django.utils import timezone
import uuid
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email est obligatoire')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Django hash automatiquement
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    
    # Champs personnalisés TERRABIA
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    role = models.CharField(
        max_length=50,
        choices=[
            ('acheteur', 'Acheteur'),
            ('vendeur', 'Vendeur'),
            ('admin', 'Administrateur'),
            ('livreur', 'Livreur'),
        ],
        default='acheteur'
    )
    
    # Champs Django requis
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # OBLIGATOIRE pour les modèles User personnalisés
    REQUIRED_FIELDS = ['role']  # email est déjà USERNAME_FIELD
    USERNAME_FIELD = 'email'    # Champ utilisé pour l'authentification
    
    objects = UserManager()     # Manager personnalisé
    
    class Meta:
        db_table = 'auth_schema_users'
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return f"{self.email} ({self.role})"


class RefreshToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    token = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    expiration = models.DateTimeField()

    class Meta:
        db_table = 'auth_schema_refresh_tokens'
        verbose_name = "Token de rafraîchissement"
        verbose_name_plural = "Tokens de rafraîchissement"

    def is_expired(self):
        """Vérifie si le token est expiré."""
        return self.expiration < timezone.now()

    def __str__(self):
        return f"Token pour {self.user.email} (expire le {self.expiration})"


class BlacklistToken(models.Model):
    token = models.CharField(max_length=512, primary_key=True)
    expiration = models.DateTimeField()

    class Meta:
        db_table = 'auth_schema_blacklist_tokens'
        verbose_name = "Token blacklisté"
        verbose_name_plural = "Tokens blacklistés"

    def is_expired(self):
        """Vérifie si le token blacklisté est expiré."""
        return self.expiration < timezone.now()

    def __str__(self):
        return f"BlacklistToken (expire le {self.expiration})"