"""
PATCH FILE: components/pricing-section.tsx
==========================================
Two surgical additions to the pricing section.
Apply both patches in order.
"""

# ─────────────────────────────────────────────────────────────────────────────
# PATCH 1: Add "Most Popular" badge to the middle plan card
#
# Find the section of your PricingSection component where it maps over plans
# and renders a card for each. Look for something like:
#   {plans.map((plan, index) => (
#
# Find the className on the outer plan card div. It will look something like:
#   className="... border ..."
#
# Change the card rendering to highlight the middle plan:
# ─────────────────────────────────────────────────────────────────────────────

# Add this logic at the top of your plans.map() callback, 
# right after the opening of the map function:

ADDITION_1 = """
  // Phase 6: mark the middle plan as "Most Popular"
  const isPopular = plans.length >= 2 && index === Math.floor(plans.length / 2);
"""

# Then find where the card's outer div className is defined and add this condition:
# Change:
#   className="bg-white rounded-2xl border border-gray-200 p-8 ..."
# To:
#   className={`bg-white rounded-2xl border p-8 ... ${isPopular ? "border-2 border-primary shadow-xl" : "border-gray-200"}`}

# And add the badge just inside the card, before the plan name:
ADDITION_2 = """
  {isPopular && (
    <div className="mb-3">
      <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
        Most Popular
      </span>
    </div>
  )}
"""


# ─────────────────────────────────────────────────────────────────────────────
# PATCH 2: Remove the debug logging line in fetchUser
# ─────────────────────────────────────────────────────────────────────────────

FIND_2 = """      if (res.status === "success") {
        setUserData(res.data);
        debugLog(res.data);
        
      }"""

REPLACE_2 = """      if (res.status === "success") {
        setUserData(res.data);
        // Phase 6: removed debug logging — was exposing user data in the browser console
      }"""
