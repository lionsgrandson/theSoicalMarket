"""
PATCH FILE: Two frontend surgical patches
==========================================
These are small find-and-replace changes.
Do NOT copy this whole file into anything.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH A: app/auth/login/LoginPage.tsx  — remove dead imports
# ─────────────────────────────────────────────────────────────────────────────

# FIND this line (line 9):
FIND_A = """import { login, setAuthFromResponse } from "@/lib/auth";"""

# REPLACE with nothing (delete the line entirely):
REPLACE_A = """// login and setAuthFromResponse removed — signIn("credentials") handles login now"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH B: app/home_dashboard/page.tsx  — remove 5 debug log statements
# Find and delete each of these lines (they appear around lines 39-70):
# ─────────────────────────────────────────────────────────────────────────────

LINES_TO_DELETE = [
    '[debug] session access token line',
    '[debug] local token line',
    '[debug] missing token message',
    '[debug] fetching profile message',
    '[debug] user data received message',
]

# For each line above: select the entire line in your editor and delete it.
# Do not replace with anything — just remove the line.
