"""
PATCH FILE: subscription_service/subscription/models.py
========================================================
One surgical replacement — the __str__ method that crashes the admin.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: Subscription.__str__ calls self.user.email but user is IntegerField
# ─────────────────────────────────────────────────────────────────────────────

FIND_1 = """    def __str__(self):
        return f"{self.user.email} - {self.plan_name or 'No Plan'} ({self.status})\""""

REPLACE_1 = """    def __str__(self):
        # FIX: was self.user.email — user is IntegerField not FK, crashed admin list
        return f"User #{self.user} — {self.plan_name or 'No Plan'} ({self.status})\""""
