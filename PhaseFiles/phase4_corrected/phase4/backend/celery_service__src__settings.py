"""
celery_service/src/settings.py  — Phase 4 & 5 final version

All scheduled tasks registered. Replace previous versions of this file.
"""

from pathlib import Path
from decouple import config
from celery.schedules import crontab

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-celery-change-me')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = ['*']
SITE_BASE_URL = config('SITE_BASE_URL', default='https://thesocialmarket.ai')

INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'rest_framework',
    'celery_s',
    'src',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'src.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': ['django.template.context_processors.request']},
}]

WSGI_APPLICATION = 'src.wsgi.application'
DATABASES = {}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'

# ── Celery ────────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://redis:6379/1')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://redis:6379/1')
CELERY_IGNORE_RESULT = True
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('EMAIL_HOST_USER', default='')

# ── Channels ──────────────────────────────────────────────────────────────────
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [config('REDIS_URL', default='redis://redis:6379/0')]},
    },
}

# ── JWT ───────────────────────────────────────────────────────────────────────
from datetime import timedelta
SIMPLE_JWT = {
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SIGNING_KEY'),
    'ACCESS_TOKEN_LIFETIME': timedelta(days=10),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=20),
}

# ── Beat Schedule — all tasks ─────────────────────────────────────────────────
CELERY_BEAT_SCHEDULE = {

    # Engagement / reminders
    'check-incomplete-profiles': {
        'task': 'celery_s.automations.check_incomplete_profiles',
        'schedule': crontab(hour=9, minute=0),          # 9am UTC daily
    },
    'pending-proposal-reminders': {
        'task': 'celery_s.automations.send_pending_proposal_reminders',
        'schedule': crontab(hour=10, minute=0),         # 10am UTC daily
    },
    'unread-notification-reminders': {
        'task': 'celery_s.automations.send_unread_notification_reminders',
        'schedule': crontab(hour=8, minute=0),          # 8am UTC daily
    },

    # Matching
    'daily-match-scan': {
        'task': 'celery_s.automations.daily_match_scan',
        'schedule': crontab(hour=7, minute=0),          # 7am UTC daily
    },

    # Platform health
    'platform-health-check': {
        'task': 'celery_s.automations.platform_health_check',
        'schedule': 300.0,                              # every 5 minutes
    },

    # Data integrity (Phase 5)
    'data-consistency-check': {
        'task': 'celery_s.automations.data_consistency_check',
        'schedule': crontab(hour=3, minute=0, day_of_week=1),  # 3am UTC every Monday
    },
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {'format': '[{levelname}] {asctime} {module}: {message}', 'style': '{'},
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler', 'formatter': 'verbose'},
    },
    'root': {'handlers': ['console'], 'level': 'INFO'},
}
