"""
Django settings for auth_service project.
Version corrigée pour TERRABIA - Résolution CORS & 404
"""

from pathlib import Path
import os
import sys
import pymysql
from datetime import timedelta

pymysql.install_as_MySQLdb()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-nr63a%qr4j(ih+&en#*^h^4lm%-p$i&9lhq&m$pi&569e7ar0+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# CORRECTION CRITIQUE : Simplifier ALLOWED_HOSTS pour développement
ALLOWED_HOSTS = ['*']  # Pour dev seulement - à restreindre en production

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    # CORSheaders RETIRÉ - Le proxy Spring Boot gère CORS
    'auth_app.apps.AuthAppConfig',
]

# REST Framework - Configuration simplifiée
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Permettre tout pour dev
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'TEST_REQUEST_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# MIDDLEWARE - SANS CORSMiddleware (géré par proxy)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# PAS DE CONFIGURATION CORS ICI - Le proxy Spring Boot s'en charge

ROOT_URLCONF = 'auth_service.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'auth_service.wsgi.application'

# Database configuration
# === DATABASES ===
if 'test' in sys.argv or 'pytest' in sys.modules:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
else:
    # OPTION A: MySQL (si la base est disponible)
    # OPTION B: SQLite (pour développement rapide - DÉCOMMENTER SI BESOIN)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME', 'terabia'),
            'USER': os.getenv('DB_USER', 'terabia_user'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'terabia_pass'),
            'HOST': os.getenv('DB_HOST', 'terra-auth-db'),
            'PORT': os.getenv('DB_PORT', '3306'),
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                'connect_timeout': 30,  # Timeout plus long
            },
        }
    }
    
    # OPTION B: SQLite pour développement (DÉCOMMENTER SI PROBLÈME MySQL)
    # DATABASES = {
    #     'default': {
    #         'ENGINE': 'django.db.backends.sqlite3',
    #         'NAME': BASE_DIR / 'db.sqlite3',
    #     }
    # }

# Password validation
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'formatters': {
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'auth_app': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'ERROR',  # Réduire le bruit des requêtes SQL
            'propagate': False,
        },
    },
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,  # Réduit à 6 pour faciliter les tests
        }
    },
]

# Configuration JWT simple
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

# Internationalization
LANGUAGE_CODE = 'fr-fr'  # Changé à français
TIME_ZONE = 'Africa/Douala'  # Fuseau Cameroun
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuration pour le modèle User personnalisé
AUTH_USER_MODEL = 'auth_app.User'

# URLs de redirection
LOGIN_URL = '/api/auth/login/'
LOGOUT_URL = '/api/auth/logout/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Configuration sécurité développement (À CHANGER EN PRODUCTION)
if DEBUG:
    # Désactiver certaines vérifications pour le dev
    SILENCED_SYSTEM_CHECKS = [
        'security.W001',  # SECURE_HSTS_SECONDS
        'security.W002',  # SECURE_SSL_REDIRECT
        'security.W003',  # SECURE_HSTS_INCLUDE_SUBDOMAINS
        'security.W004',  # SECURE_HSTS_PRELOAD
        'security.W008',  # SECURE_SSL_REDIRECT
        'security.W009',  # SECURE_HSTS_SECONDS
        'security.W012',  # SESSION_COOKIE_SECURE
        'security.W016',  # CSRF_COOKIE_SECURE
    ]
    
    # Autoriser les requêtes sans CSRF en dev (pour API testing)
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:8082',
        'http://127.0.0.1:5173',
    ]