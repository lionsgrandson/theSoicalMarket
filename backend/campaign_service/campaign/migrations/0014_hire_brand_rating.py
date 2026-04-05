# Generated manually for Phase 7.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("campaign", "0013_hire_budgetnegotiable"),
    ]

    operations = [
        migrations.AddField(
            model_name="hire",
            name="brand_rating",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
