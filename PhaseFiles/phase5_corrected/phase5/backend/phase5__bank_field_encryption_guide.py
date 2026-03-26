"""
Phase 5: Encrypt bank account fields in InfluencerInfo model.

MIGRATION STRATEGY (zero data loss):
  Step 1: Deploy this file — adds encrypted_* shadow fields (nullable)
  Step 2: Run: python manage.py makemigrations && python manage.py migrate
  Step 3: Run the backfill script below to copy existing data → encrypted fields
  Step 4: Deploy updated model that removes the old plain-text fields
  Step 5: Run makemigrations && migrate again

NEVER do Step 1 and Step 4 in the same deployment.
"""

# ─── Install requirement ──────────────────────────────────────────────────────
# Add to user_service/requirements.txt:
#   django-cryptography==1.1
#
# Add to user_service/.env:
#   DJANGO_CRYPTOGRAPHY_KEY=<generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">


# ─── Step 1: Add to user_service/authentication/models.py ───────────────────
# Import at top of models.py:
#   from django_cryptography.fields import encrypt

# Add these fields to the InfluencerInfo model ALONGSIDE the existing plain-text fields:
MIGRATION_STEP_1_FIELDS = """
    # Phase 5: Encrypted shadow fields — added alongside plain-text fields
    # After backfill (Step 3), the plain-text fields below will be removed
    account_number_encrypted = encrypt(models.CharField(max_length=100, blank=True, null=True))
    routing_number_encrypted = encrypt(models.CharField(max_length=100, blank=True, null=True))
    bank_name_encrypted = encrypt(models.CharField(max_length=100, blank=True, null=True))
    paypal_email_encrypted = encrypt(models.CharField(max_length=100, blank=True, null=True))
"""


# ─── Step 3: Backfill script ──────────────────────────────────────────────────
# Run this as a Django management command after Step 2 migration is applied.
# Save as: user_service/authentication/management/commands/encrypt_bank_fields.py

BACKFILL_SCRIPT = """
from django.core.management.base import BaseCommand
from authentication.models import InfluencerInfo


class Command(BaseCommand):
    help = 'Backfill bank account data from plain-text fields to encrypted fields'

    def handle(self, *args, **kwargs):
        profiles = InfluencerInfo.objects.filter(account_number__isnull=False)
        count = 0

        for profile in profiles:
            profile.account_number_encrypted = profile.account_number
            profile.routing_number_encrypted = profile.routing_number
            profile.bank_name_encrypted = profile.bank_name
            profile.paypal_email_encrypted = profile.paypal_email
            profile.save(update_fields=[
                'account_number_encrypted',
                'routing_number_encrypted',
                'bank_name_encrypted',
                'paypal_email_encrypted',
            ])
            count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully encrypted {count} influencer bank records')
        )
"""

# Run with:
#   docker compose exec user_service python manage.py encrypt_bank_fields


# ─── Step 4: Final model (after backfill is confirmed complete) ───────────────
# Replace the plain-text fields with the encrypted versions in InfluencerInfo:
MIGRATION_STEP_4_MODEL_FIELDS = """
    # Phase 5 final: plain-text fields removed, encrypted fields are now primary
    from django_cryptography.fields import encrypt

    account_number = encrypt(models.CharField(max_length=100, blank=True, null=True))
    routing_number = encrypt(models.CharField(max_length=100, blank=True, null=True))
    bank_name = encrypt(models.CharField(max_length=100, blank=True, null=True))
    paypal_email = encrypt(models.CharField(max_length=100, blank=True, null=True))
"""

# After Step 4 migration, the data is encrypted at rest.
# Django reads/writes transparently — no changes needed in serializers or views.
# The encrypted values cannot be read directly from the database without the DJANGO_CRYPTOGRAPHY_KEY.
