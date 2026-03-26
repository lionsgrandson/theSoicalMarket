"""
PATCH FILE: campaign_service/campaign/models.py
===============================================
One surgical replacement only — the hardcoded ImgBB API key.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: ImgBB key hardcoded in Files.save()
# ─────────────────────────────────────────────────────────────────────────────

FIND_1 = """            api_key = '45ed232aea4d4f4e717f45978a925c78' """

REPLACE_1 = """            # FIX: was hardcoded API key — now reads from environment
            from decouple import config
            api_key = config('IMGBB_API_KEY')"""


# ─────────────────────────────────────────────────────────────────────────────
# ACTION REQUIRED BEFORE DEPLOYING:
# 1. Add IMGBB_API_KEY=<your-new-key> to campaign_service/.env
# 2. Go to imgbb.com → Account → API → generate a new key
#    (the old key '45ed232...' was publicly exposed in git — rotate it)
# ─────────────────────────────────────────────────────────────────────────────
