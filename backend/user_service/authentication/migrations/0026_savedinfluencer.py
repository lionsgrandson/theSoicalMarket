# Generated manually for Phase 7.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0025_alter_brandinfo_business_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="SavedInfluencer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("brand_user_id", models.IntegerField()),
                ("influencer_user_id", models.IntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "unique_together": {("brand_user_id", "influencer_user_id")},
            },
        ),
    ]
