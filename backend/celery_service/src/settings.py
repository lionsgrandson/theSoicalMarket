from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-test-key')

DEBUG = config('DEBUG', default=True, cast=bool)


ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    # Remove Admin, Auth, Sessions, Messages, ContentTypes because they require a DB
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework', 
    # Note: SimpleJWT usually requires django.contrib.auth and a DB User model. 
    # If you need Auth without DB, you have to handle token verification manually 
    # or keep a dummy SQLite DB. For now, I have removed it to satisfy "No DB".
    
    'celery_s',
    'src', # Ensure your app folder is included so tasks are discovered
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'src.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'src.wsgi.application'

# Remove ASGI_APPLICATION

# Database
# explicitly set to empty to ensure no DB connections are attempted
DATABASES = {} 

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Celery Configuration
CELERY_BROKER_URL = "redis://redis:6379/1"
CELERY_RESULT_BACKEND = "redis://redis:6379/1"
CELERY_IGNORE_RESULT = True
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# Logging (Optional but recommended for debugging tasks)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

EMAIL_BACKEND = config('EMAIL_BACKEND')
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT')
EMAIL_USE_TLS = config('EMAIL_USE_TLS')
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')



# CELERY_BEAT_SCHEDULE = {
#     'run-every-10-seconds': {
#         'task': 'celery_s.tasks.debug_task',
#         'schedule': 10.0,
#         'args': ["Hello World"],
#     },
# }