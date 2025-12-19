import os, sys
import environ
import requests
import json
from pathlib import Path
import threading
import time
import socket

# =============================================================================
# CONFIGURATION DE BASE - SIMPLIFIÉE POUR DOCKER
# =============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables - VERSION SIMPLIFIÉE
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# Configuration Service - VARIABLES D'ENVIRONNEMENT DIRECTES
SERVICE_NAME = os.environ.get('SERVICE_NAME', 'terra-order-transaction-service')
SERVICE_PORT = int(os.environ.get('SERVICE_PORT', '8086'))
SERVICE_PROFILE = os.environ.get('SERVICE_PROFILE', 'docker')

# Configuration Eureka Client
try:
    from py_eureka_client import eureka_client
    EUREKA_AVAILABLE = True
    print("✅ py-eureka-client importé avec succès")
except ImportError as e:
    print(f"⚠️ py-eureka-client non installé: {e}")
    EUREKA_AVAILABLE = False

# =============================================================================
# CONFIGURATION DJANGO ESSENTIELLE - SANS CONFIG SERVICE
# =============================================================================

# SECRET_KEY - CRITIQUE
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-8$6zq&8j^b-7)rj$0h4a@kl*mx1!9v5c+_p!2s#3g5d7f!h6i8')
DEBUG = os.environ.get('DEBUG', 'false').lower() == 'true'

ALLOWED_HOSTS = [
    '*',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'terra-order-transaction-service',
    'host.docker.internal'
]

print(f"🔧 Configuration Service:")
print(f"   - SERVICE_NAME: {SERVICE_NAME}")
print(f"   - SERVICE_PORT: {SERVICE_PORT}")
print(f"   - DEBUG: {DEBUG}")

# =============================================================================
# CONFIGURATION BASE DE DONNÉES - VERSION DIRECTE
# =============================================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'terra_orders_db'),
        'USER': os.environ.get('DB_USER', 'terra_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'terra_password'),
        'HOST': os.environ.get('DB_HOST', 'terra-orders-db'),  # CRITIQUE: nom du service Docker
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}

print(f"🔧 Configuration Base de Données:")
print(f"   - HOST: {DATABASES['default']['HOST']}")
print(f"   - PORT: {DATABASES['default']['PORT']}")
print(f"   - NAME: {DATABASES['default']['NAME']}")

# =============================================================================
# SETTINGS DJANGO STANDARD
# =============================================================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'channels',
    'order_app',
    'django_celery_results',
    'drf_spectacular',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'terra_orders.urls'
WSGI_APPLICATION = 'terra_orders.wsgi.application'
ASGI_APPLICATION = 'terra_orders.asgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Douala'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://frontend:5173",
]

# =============================================================================
# CONFIGURATION RABBITMQ & CELERY
# =============================================================================

# RabbitMQ Configuration - SIMPLIFIÉ
RABBITMQ_HOST = os.environ.get('RABBITMQ_HOST', 'terra-rabbitmq')
RABBITMQ_PORT = int(os.environ.get('RABBITMQ_PORT', '5672'))
RABBITMQ_USERNAME = os.environ.get('RABBITMQ_USERNAME', 'guest')
RABBITMQ_PASSWORD = os.environ.get('RABBITMQ_PASSWORD', 'guest')

CELERY_BROKER_URL = f"amqp://{RABBITMQ_USERNAME}:{RABBITMQ_PASSWORD}@{RABBITMQ_HOST}:{RABBITMQ_PORT}//"
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Channels (Redis)
REDIS_HOST = os.environ.get('REDIS_HOST', 'terra-redis')
REDIS_PORT = int(os.environ.get('REDIS_PORT', '6379'))

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(REDIS_HOST, REDIS_PORT)],
        },
    },
}

# =============================================================================
# LOGGING
# =============================================================================

LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'stream': sys.stdout,
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGS_DIR, 'django.log'),
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'order_app': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Swagger
SPECTACULAR_SETTINGS = {
    'TITLE': 'Terrabia Order & Transaction Service API',
    'DESCRIPTION': 'API for managing orders and transactions in Terrabia platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# =============================================================================
# CONFIGURATION EUREKA - VERSION SIMPLIFIÉE ET ROBUSTE
# =============================================================================

EUREKA_ENABLED = os.environ.get('EUREKA_ENABLED', 'true').lower() == 'true'
EUREKA_SERVER_URL = os.environ.get('EUREKA_SERVER_URL', 'http://terra-registry-service:8761/eureka/')
EUREKA_APP_NAME = os.environ.get('EUREKA_APP_NAME', 'TERRA-ORDER-TRANSACTION-SERVICE')
EUREKA_INSTANCE_HOST = os.environ.get('EUREKA_INSTANCE_HOST', 'terra-order-transaction-service')
EUREKA_INSTANCE_ID = f"{EUREKA_INSTANCE_HOST}:{SERVICE_PORT}"

def test_network_connectivity():
    """Teste la connectivité réseau avant d'essayer quoi que ce soit"""
    import urllib3
    urllib3.disable_warnings()
    
    services_to_test = [
        ('terra-registry-service', 8761, 'Eureka'),
        ('terra-orders-db', 5432, 'PostgreSQL'),
        ('terra-rabbitmq', 5672, 'RabbitMQ'),
        ('terra-redis', 6379, 'Redis'),
    ]
    
    print("🔍 Test de connectivité réseau...")
    for host, port, service_name in services_to_test:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            result = sock.connect_ex((host, port))
            sock.close()
            if result == 0:
                print(f"   ✅ {service_name} ({host}:{port}) accessible")
            else:
                print(f"   ❌ {service_name} ({host}:{port}) non accessible")
        except Exception as e:
            print(f"   ⚠️  {service_name} ({host}:{port}) erreur: {str(e)[:50]}")
    
    print("🔍 Test de santé des services...")
    
    # Tester Eureka
    try:
        response = requests.get(EUREKA_SERVER_URL.rstrip('/') + '/apps', timeout=5, verify=False)
        if response.status_code == 200:
            print(f"   ✅ Eureka API accessible (HTTP {response.status_code})")
            return True
        else:
            print(f"   ⚠️  Eureka répond avec {response.status_code}")
    except Exception as e:
        print(f"   ❌ Eureka non accessible: {str(e)[:100]}")
    
    return False

def simple_eureka_register():
    """Enregistrement Eureka ultra-simplifié"""
    if not EUREKA_AVAILABLE or not EUREKA_ENABLED:
        print("⚠️ Eureka désactivé ou non disponible")
        return False
    
    try:
        print(f"🔧 Tentative d'enregistrement Eureka...")
        print(f"   Instance: {EUREKA_INSTANCE_ID}")
        
        # Configuration minimale
        eureka_client.init(
            eureka_server=EUREKA_SERVER_URL.rstrip('/'),
            app_name=EUREKA_APP_NAME,
            instance_port=SERVICE_PORT,
            instance_host=EUREKA_INSTANCE_HOST,
            instance_id=EUREKA_INSTANCE_ID,
            renewal_interval_in_secs=30,
            duration_in_secs=90,
        )
        
        print(f"✅ Enregistrement Eureka réussi: {EUREKA_INSTANCE_ID}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur Eureka: {str(e)[:200]}")
        return False

def start_eureka_with_fallback():
    """Démarre Eureka avec des retry intelligents"""
    if not EUREKA_ENABLED:
        print("ℹ️  Eureka désactivé via variable d'environnement")
        return
    
    print("=" * 60)
    print("🔄 TENTATIVE D'ENREGISTREMENT EUREKA")
    print("=" * 60)
    
    # Attendre un peu au début
    time.sleep(15)
    
    # Essayer plusieurs fois
    max_attempts = 10
    for attempt in range(1, max_attempts + 1):
        print(f"\n🔄 Tentative {attempt}/{max_attempts}...")
        
        # Tester la connectivité d'abord
        if test_network_connectivity():
            # Essayer de s'enregistrer
            if simple_eureka_register():
                print(f"🌐 Vérifiez sur http://localhost:8761")
                return
        else:
            print(f"   ⏳ Attente avant nouvelle tentative...")
        
        # Backoff exponentiel
        wait_time = min(attempt * 10, 60)  # Max 60 secondes
        time.sleep(wait_time)
    
    print(f"❌ Échec après {max_attempts} tentatives")
    print(f"ℹ️  Le service fonctionnera sans Eureka")

# =============================================================================
# HEALTH CHECK ENDPOINT - CRITIQUE POUR DOCKER HEALTHCHECK
# =============================================================================

def get_service_health():
    """Retourne l'état de santé du service pour Docker healthcheck"""
    health_status = {
        'status': 'UP',
        'components': {},
        'service': SERVICE_NAME,
        'timestamp': time.time()
    }
    
    # Vérifier la base de données
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['components']['database'] = {'status': 'UP'}
    except Exception as e:
        health_status['components']['database'] = {'status': 'DOWN', 'details': str(e)}
        health_status['status'] = 'DOWN'
    
    # Vérifier Redis
    try:
        import redis
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, socket_timeout=1)
        r.ping()
        health_status['components']['redis'] = {'status': 'UP'}
    except Exception as e:
        health_status['components']['redis'] = {'status': 'DOWN', 'details': str(e)}
    
    return health_status

# =============================================================================
# DÉMARRAGE AUTOMATIQUE EUREKA
# =============================================================================

if __name__ != '__main__' and 'runserver' in sys.argv:
    # Démarrer Eureka dans un thread séparé
    def delayed_eureka_start():
        """Démarre Eureka après un délai"""
        print("⏳ Démarrage différé d'Eureka (30s)...")
        time.sleep(30)
        start_eureka_with_fallback()
    
    eureka_thread = threading.Thread(target=delayed_eureka_start, daemon=True)
    eureka_thread.start()
    print("🧵 Thread Eureka démarré")

# =============================================================================
# BUSINESS CONFIGURATION
# =============================================================================

BUSINESS_CONFIG = {
    'ORDER_CONFIG': {
        'status': {
            'pending': 'PENDING',
            'confirmed': 'CONFIRMED',
            'paid': 'PAID',
            'in_delivery': 'IN_DELIVERY',
            'delivered': 'DELIVERED',
            'completed': 'COMPLETED',
            'cancelled': 'CANCELLED'
        },
        'number_prefix': 'TRB'
    },
    'TRANSACTION_CONFIG': {
        'types': {
            'payment': 'PAYMENT',
            'refund': 'REFUND',
            'commission': 'COMMISSION',
            'payout': 'PAYOUT'
        },
        'payment_methods': {
            'mobile_money': 'MOBILE_MONEY',
            'orange_money': 'ORANGE_MONEY',
            'mtn_momo': 'MTN_MOMO',
            'cash': 'CASH',
            'bank_transfer': 'BANK_TRANSFER'
        },
        'status': {
            'pending': 'PENDING',
            'processing': 'PROCESSING',
            'success': 'SUCCESS',
            'failed': 'FAILED',
            'reversed': 'REVERSED'
        },
        'reference_prefix': 'TXN'
    },
    'PAYMENT_CONFIG': {
        'simulation_enabled': True,
        'platform_commission_rate': 5.0
    },
    'DELIVERY_CONFIG': {
        'base_fee': 500,
        'free_threshold': 10000
    }
}