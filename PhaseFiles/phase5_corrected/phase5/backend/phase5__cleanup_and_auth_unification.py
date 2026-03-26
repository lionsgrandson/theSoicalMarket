"""
Phase 5: Cleanup & Auth Unification Guide
==========================================
This file is documentation — not executable code.
Work through each section in order.
"""

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: Dead code to delete
# ─────────────────────────────────────────────────────────────────────────────

DEAD_CODE_TO_DELETE = {

    # Frontend — stray files
    "frontend root '--' file": {
        "path": "bkcoaching-main/--",
        "action": "delete",
        "why": "Stray artifact from a bad git operation. Not imported anywhere."
    },
    "lib/apple-auth.ts": {
        "path": "lib/apple-auth.ts",
        "action": "delete",
        "why": "100% commented out. Apple auth is not implemented. Remove the dead file."
    },

    # Backend — commented-out consumers in celery_service
    "celery_service consumers.py": {
        "path": "celery_service/celery_s/consumers.py",
        "action": "delete or replace with empty file",
        "why": "100% commented out. Chat consumers live in chat_service/chat/consumers.py."
    },

    # Backend — old signal logic superseded by Phase 4
    "Previous campaign signals": {
        "path": "campaign_service/campaign/signals.py",
        "action": "replaced by Phase 4 version (already in your fixes packages)",
        "why": "Old version sent synchronous httpx calls and had duplicate email sends."
    },

    # Backend — temp PDF files committed to repo
    "campaign_service/temp/ PDFs": {
        "path": "campaign_service/temp/GTC_Mathematics_*.pdf",
        "action": "delete all PDF files, add temp/ to .gitignore",
        "why": "Personal test uploads committed to the repo. Add to .gitignore immediately."
    },

    # Backend — committed SQLite DB
    "gateway_service/db.sqlite3": {
        "path": "gateway_service/db.sqlite3",
        "action": "delete and add db.sqlite3 to .gitignore",
        "why": "Database file committed to repo. Contains real data, should never be in git."
    },

    # Backend — committed key file
    "key.pem in repo root": {
        "path": "key.pem",
        "action": "delete immediately, add *.pem to .gitignore, rotate the key",
        "why": "Private key in source control. This is the 'Exposed Private Keys' audit finding."
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: .gitignore additions
# Add these to the root .gitignore of both repos
# ─────────────────────────────────────────────────────────────────────────────

GITIGNORE_ADDITIONS = """
# Secrets
*.pem
*.key
.env
.env.*
!.env.example

# Databases
*.sqlite3
db.sqlite3

# Uploaded files / temp
temp/
*/temp/*.pdf

# Python
__pycache__/
*.pyc
*.pyo

# Node
node_modules/
.next/
"""


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: Auth unification — choosing one system
# ─────────────────────────────────────────────────────────────────────────────
#
# Currently: email login goes through custom JWT only.
#            Google/Apple go through NextAuth only.
#            The middleware tries to read BOTH, creating conflicts.
#
# Recommended approach: Make NextAuth the single cookie manager.
# Custom JWT from Django remains the backend auth token.
# NextAuth wraps it and stores it in its own cookie.
#
# This is the minimal change that resolves the conflict without a rewrite.

AUTH_UNIFICATION_PLAN = {

    "step_1": {
        "what": "Create a NextAuth credentials provider for email login",
        "where": "lib/auth-options.ts (or wherever your NextAuth config is)",
        "code": """
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user_service/login/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );
        const data = await res.json();
        if (data?.data?.access_token) {
          return {
            id: data.data.user?.id,
            email: credentials.email,
            backendAccessToken: data.data.access_token,
            backendRefreshToken: data.data.refresh_token,
          };
        }
        return null;
      },
    }),
    // Keep Google and Apple providers here
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendAccessToken = user.backendAccessToken;
        token.backendRefreshToken = user.backendRefreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.backendAccessToken;
      session.refresh_token = token.backendRefreshToken;
      return session;
    },
  },
  pages: { signIn: '/auth/login' },
};
""",
    },

    "step_2": {
        "what": "Update login page to use signIn('credentials') instead of custom login()",
        "where": "app/auth/login/page.tsx — replace handleSubmit",
        "code": """
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,  // handle redirect ourselves
    });
    if (result?.error) {
      setErrors({ general: 'Invalid email or password' });
    } else {
      router.push(returnTo || '/home_dashboard');
    }
  } finally {
    setLoading(false);
  }
};
""",
    },

    "step_3": {
        "what": "Remove the Zustand token sync from login — NextAuth owns the cookie now",
        "where": "app/auth/login/page.tsx — remove setAuthFromResponse() call",
        "note": "AuthSessionSync.tsx already syncs NextAuth → Zustand. No manual sync needed.",
    },

    "step_4": {
        "what": "Keep Zustand for UI state only, not as the auth source of truth",
        "note": (
            "Zustand still useful for: current user data (name, profile), "
            "UI loading states, quick access to user fields. "
            "But the token cookie is owned by NextAuth. "
            "The middleware reads from NextAuth cookie — single source, no conflict."
        ),
    },

    "step_5": {
        "what": "Remove the custom cookie-setting code from useAuthStore.setToken()",
        "why": (
            "Once NextAuth manages the auth cookie, the manual "
            "Cookies.set('access_token', ...) in Zustand creates a duplicate cookie "
            "that the middleware may accidentally prefer over the NextAuth one. "
            "Keep setToken() for Zustand state but remove the Cookies.set() calls."
        ),
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: filter_influencers budget_range bug fix
# ─────────────────────────────────────────────────────────────────────────────
#
# The existing filter_influencers view has a bug in the budget_range block:
#   (budget_min, budget_max) = reach.strip().split(...)   ← uses wrong variable 'reach'
#   budget_min, budget_max = int(audience_count_min), int(audience_count_max)  ← wrong vars
#
# These lines will throw a NameError if budget_range is ever passed.
# Fix:

BUDGET_RANGE_FIX = """
budget_range = request.data.get('budget_range')
if budget_range:
    try:
        parts = budget_range.strip().split('-', maxsplit=1)
        if len(parts) == 2:
            budget_min = int(parts[0].strip())
            budget_max = int(parts[1].strip())
            # ... rest of annotation logic unchanged
    except (ValueError, IndexError):
        pass  # Invalid format — skip filter rather than crashing
"""


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: UserProfileSerializer — remove current_verification_code from output
# ─────────────────────────────────────────────────────────────────────────────
#
# The UserProfileSerializer currently exposes current_verification_code in
# every API response. This is the OTP used for email verification and
# password reset. It should NEVER be returned to clients.
#
# Fix in user_service/authentication/serializers.py:
# Remove 'current_verification_code' from UserProfileSerializer.Meta.fields
# and add it to read_only_fields of UserProfileUpdateSerializer only.

SERIALIZER_SECURITY_FIX = """
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    influencer_profile = InfluencerInfoSerializer(read_only=True)
    brand_profile = BrandInfoSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'is_verified',
            'signup_method', 'signed_up_as',
            # current_verification_code REMOVED — security fix
            'influencer_profile', 'brand_profile',
        ]
"""
