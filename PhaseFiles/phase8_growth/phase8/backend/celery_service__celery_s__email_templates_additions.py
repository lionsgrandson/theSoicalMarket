"""
ADDITIONS FILE: celery_service/celery_s/email_templates.py
===========================================================
Open your existing email_templates.py.
Find the TEMPLATES = { ... } dictionary.
Add ALL of the entries below inside it, before the closing }.

These are the 7 new email templates for Phase 8.
"""

# ─────────────────────────────────────────────────────────────────────────────
# ADD THESE ENTRIES inside the TEMPLATES dict in email_templates.py
# ─────────────────────────────────────────────────────────────────────────────

NEW_TEMPLATES = """
    'WEEKLY_DIGEST_INFLUENCER': {
        'subject': lambda c: f"Your week on The Social Market, {c.get('first_name', 'there')}",
        'cta_url': lambda c: "https://thesocialmarket.ai/influencer-dashboard",
        'cta_label': lambda c: "Open my dashboard →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Here's what happened on The Social Market this week:</p>
            <ul>
                <li><strong>{c.get('new_brand_count', 0)} new brands</strong> joined in your niche</li>
                <li>You have <strong>{c.get('pending_proposals', 0)} pending proposals</strong> awaiting your response</li>
                <li>Your total earnings to date: <strong>${c.get('total_earned', 0)}</strong></li>
            </ul>
            <p>Log in to see your matches and respond to any open proposals.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, here's your weekly summary. {c.get('new_brand_count', 0)} new brands joined. {c.get('pending_proposals', 0)} proposals pending. Visit thesocialmarket.ai to catch up.",
    },

    'WEEKLY_DIGEST_BRAND': {
        'subject': lambda c: f"Your week on The Social Market, {c.get('first_name', 'there')}",
        'cta_url': lambda c: "https://thesocialmarket.ai/brand-dashboard",
        'cta_label': lambda c: "Open my dashboard →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Here's your weekly update:</p>
            <ul>
                <li><strong>{c.get('new_influencer_count', 0)} new influencers</strong> joined in your niche this week</li>
                <li>You have <strong>{c.get('pending_proposal_count', 0)} proposals</strong> waiting for a response</li>
                <li><strong>{c.get('campaigns_ending_soon', 0)} campaigns</strong> end in the next 3 days</li>
            </ul>
            <p>Log in to keep your campaigns moving.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, weekly summary: {c.get('new_influencer_count', 0)} new influencers, {c.get('pending_proposal_count', 0)} pending proposals. Visit thesocialmarket.ai.",
    },

    'RE_ENGAGEMENT': {
        'subject': lambda c: f"We miss you, {c.get('first_name', 'there')} 👋",
        'cta_url': lambda c: f"https://thesocialmarket.ai/{'influencer' if c.get('signed_up_as') in ['influencer','both'] else 'brand'}-dashboard",
        'cta_label': lambda c: "Come back and explore →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>It's been a while since we've seen you on The Social Market — and a lot has changed.</p>
            <p>New brands and influencers have joined, new campaigns are live, and your profile is ready to connect you with the right people.</p>
            <p>Come back and see what you've been missing.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, it's been a while! Come back to The Social Market — new opportunities are waiting. Visit thesocialmarket.ai",
    },

    'CAMPAIGN_DEADLINE_BRAND': {
        'subject': lambda c: f"Reminder: your campaign ends in {c.get('days_remaining', 3)} days",
        'cta_url': lambda c: "https://thesocialmarket.ai/brand-dashboard/campaigns",
        'cta_label': lambda c: "View my campaigns →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Your campaign <strong>{c.get('campaign_name', '')}</strong> ends in <strong>{c.get('days_remaining', 3)} days</strong>.</p>
            <p>{c.get('influencer_name', 'Your influencer')} is working on your deliverables. Once they're done, you'll be able to mark the campaign complete and leave a rating.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, your campaign ends in {c.get('days_remaining', 3)} days. Visit your dashboard to review progress.",
    },

    'CAMPAIGN_DEADLINE_INFLUENCER': {
        'subject': lambda c: f"Reminder: {c.get('campaign_name', 'your campaign')} ends in {c.get('days_remaining', 3)} days",
        'cta_url': lambda c: "https://thesocialmarket.ai/influencer-dashboard/campaigns",
        'cta_label': lambda c: "View my campaigns →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Just a reminder that <strong>{c.get('campaign_name', 'your campaign')}</strong> with <strong>{c.get('brand_name', '')}</strong> ends in <strong>{c.get('days_remaining', 3)} days</strong>.</p>
            <p>Make sure you've completed your deliverables before the deadline.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, {c.get('campaign_name', 'your campaign')} ends in {c.get('days_remaining', 3)} days. Log in to submit your deliverables.",
    },

    'SUBSCRIPTION_RENEWAL_REMINDER': {
        'subject': lambda c: (
            f"Your {c.get('plan_name', 'plan')} access ends in {c.get('days_until_renewal', 7)} days"
            if c.get('cancel_at_period_end')
            else f"Your {c.get('plan_name', 'plan')} renews in {c.get('days_until_renewal', 7)} days"
        ),
        'cta_url': lambda c: "https://thesocialmarket.ai/influencer-dashboard/subscription",
        'cta_label': lambda c: "Manage subscription →",
        'body_html': lambda c: (
            f\"""<p>Hi {c.get('first_name', 'there')},</p>
            <p>Your <strong>{c.get('plan_name', 'plan')}</strong> subscription is set to <strong>expire in {c.get('days_until_renewal', 7)} days</strong>.</p>
            <p>After that you'll lose access to messaging, proposals, and your match recommendations. Reactivate any time from your dashboard.</p>\"""
            if c.get('cancel_at_period_end')
            else f\"""<p>Hi {c.get('first_name', 'there')},</p>
            <p>Your <strong>{c.get('plan_name', 'plan')}</strong> subscription renews automatically in <strong>{c.get('days_until_renewal', 7)} days</strong>.</p>
            <p>Nothing to do — you're all set. Manage your subscription from your dashboard.</p>\"""
        ),
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, your {c.get('plan_name', 'plan')} {'expires' if c.get('cancel_at_period_end') else 'renews'} in {c.get('days_until_renewal', 7)} days.",
    },

    'REVIEW_REQUEST_BRAND': {
        'subject': lambda c: f"How did it go with {c.get('influencer_name', 'your influencer')}?",
        'cta_url': lambda c: f"https://thesocialmarket.ai/brand-dashboard/campaigns",
        'cta_label': lambda c: "Leave a rating →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Your campaign <strong>{c.get('campaign_name', '')}</strong> with <strong>{c.get('influencer_name', '')}</strong> is complete.</p>
            <p>Ratings help other brands find great collaborators. It only takes 10 seconds.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, your campaign is complete. Please rate your experience with {c.get('influencer_name', 'your influencer')}.",
    },

    'REVIEW_REQUEST_INFLUENCER': {
        'subject': lambda c: f"How was working with {c.get('brand_name', 'the brand')}?",
        'cta_url': lambda c: f"https://thesocialmarket.ai/influencer-dashboard/campaigns",
        'cta_label': lambda c: "Leave a rating →",
        'body_html': lambda c: f\"""
            <p>Hi {c.get('first_name', 'there')},</p>
            <p>Your campaign <strong>{c.get('campaign_name', '')}</strong> with <strong>{c.get('brand_name', '')}</strong> has been marked complete.</p>
            <p>Help other influencers by rating this brand. It only takes a moment.</p>
        \""",
        'body_plain': lambda c: f"Hi {c.get('first_name', 'there')}, your campaign is complete. Please rate your experience with {c.get('brand_name', 'the brand')}.",
    },
"""
