import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken
from django import forms
from django.conf import settings
from django.db import models


def _derive_fernet_key() -> bytes:
    configured_key = getattr(settings, "PAYMENT_FIELD_ENCRYPTION_KEY", "") or ""
    if configured_key:
        return configured_key.encode()

    secret_key = settings.SECRET_KEY.encode()
    return base64.urlsafe_b64encode(hashlib.sha256(secret_key).digest())


def _get_cipher() -> Fernet:
    return Fernet(_derive_fernet_key())


class EncryptedCharField(models.TextField):
    description = "Encrypted text stored as ciphertext"

    def __init__(self, *args, **kwargs):
        self.max_length = kwargs.get("max_length")
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        return self.to_python(value)

    def to_python(self, value):
        if value in (None, ""):
            return value

        if not isinstance(value, str):
            value = str(value)

        try:
            return _get_cipher().decrypt(value.encode()).decode()
        except (InvalidToken, ValueError, TypeError):
            return value

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value in (None, ""):
            return value

        if not isinstance(value, str):
            value = str(value)

        try:
            _get_cipher().decrypt(value.encode())
            return value
        except (InvalidToken, ValueError, TypeError):
            return _get_cipher().encrypt(value.encode()).decode()

    def formfield(self, **kwargs):
        defaults = {
            "form_class": forms.CharField,
            "max_length": self.max_length,
            "widget": forms.TextInput,
        }
        defaults.update(kwargs)
        return super().formfield(**defaults)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        path = "authentication.fields.EncryptedCharField"
        if self.max_length is not None:
            kwargs["max_length"] = self.max_length
        return name, path, args, kwargs
