"""
celery_service/celery_s/email_templates.py

Central registry of every transactional email the platform sends.
Each template is a plain dict — no magic, easy to add new ones.

Usage:
    from celery_s.email_templates import render_email, EMAIL_TEMPLATES
    subject, html = render_email('EMAIL_VERIFIED', {
        'first_name': 'Sarah',
        'dashboard_url': 'https://thesocialmarket.ai/influencer-dashboard',
    })
"""

import os

BASE_URL = os.environ.get('SITE_BASE_URL', 'https://thesocialmarket.ai')

# ─── Shared HTML wrapper ──────────────────────────────────────────────────────

_BASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>{subject}</title>
  <style>
    body{{margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}}
    .wrap{{width:100%;background:#f4f4f7;padding:32px 16px;box-sizing:border-box;}}
    .card{{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);}}
    .hd{{background:#0f172a;padding:28px 36px;text-align:center;}}
    .hd-txt{{color:#fff;font-size:16px;font-weight:700;letter-spacing:0.04em;margin:0;}}
    .bd{{padding:36px 36px 24px;}}
    .greeting{{font-size:18px;font-weight:600;color:#0f172a;margin:0 0 14px;}}
    .msg{{font-size:15px;color:#374151;line-height:1.75;margin:0 0 28px;}}
    .msg strong{{color:#0f172a;}}
    .cta{{display:block;width:fit-content;background:#facc15;color:#0f172a !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;margin:0 auto 10px;text-align:center;}}
    .cta-sub{{text-align:center;font-size:12px;color:#9ca3af;margin:0 0 24px;}}
    .divider{{height:1px;background:#f0f0f0;margin:24px 0;}}
    .sign{{font-size:14px;color:#374151;margin:0;}}
    .ft{{background:#f8fafc;padding:18px 36px;text-align:center;}}
    .ft p{{font-size:12px;color:#9ca3af;margin:4px 0;line-height:1.6;}}
    .ft a{{color:#6b7280;text-decoration:underline;}}
    @media(max-width:600px){{.bd,.ft{{padding-left:20px;padding-right:20px;}}.cta{{width:100%;box-sizing:border-box;}}}}
  </style>
</head>
<body>
<div class="wrap"><div class="card">
  <div class="hd"><p class="hd-txt">THE SOCIAL MARKET</p></div>
  <div class="bd">
    <p class="greeting">Dear {first_name},</p>
    <div class="msg">{body}</div>
    {cta_block}
    <div class="divider"></div>
    <p class="sign">Best Regards,<br/><strong>The Social Market Team</strong></p>
  </div>
  <div class="ft">
    <p>You received this because you have an account at <a href="{base_url}">thesocialmarket.ai</a>.</p>
    <p><a href="{base_url}/settings/notifications">Manage notification preferences</a></p>
  </div>
</div></div>
</body></html>"""

_CTA_BLOCK = '<a class="cta" href="{url}">{label}</a><p class="cta-sub">Or visit: <a href="{url}" style="color:#6b7280">{url}</a></p>'


def _cta(url: str, label: str) -> str:
    return _CTA_BLOCK.format(url=url, label=label)


def render_email(template_key: str, context: dict) -> tuple[str, str, str]:
    """
    Returns (subject, plain_text, html) for the given template key and context.
    Raises KeyError if the template doesn't exist.
    """
    tmpl = EMAIL_TEMPLATES[template_key]
    subject = tmpl['subject'](context)
    body_html = tmpl['body_html'](context)
    body_plain = tmpl['body_plain'](context)
    cta_url = tmpl.get('cta_url', lambda c: None)(context)
    cta_label = tmpl.get('cta_label', lambda c: '')(context)

    cta_block = _cta(cta_url, cta_label) if cta_url else ''

    html = _BASE_HTML.format(
        subject=subject,
        first_name=context.get('first_name', 'there'),
        body=body_html,
        cta_block=cta_block,
        base_url=BASE_URL,
    )
    plain = (
        f"Dear {context.get('first_name', 'there')},\n\n"
        f"{body_plain}\n\n"
        + (f"{cta_label}: {cta_url}\n\n" if cta_url else "")
        + "Best Regards,\nThe Social Market Team"
    )
    return subject, plain, html


# ─── Template definitions ─────────────────────────────────────────────────────
# Each entry has:
#   subject    : callable(context) → str
#   body_html  : callable(context) → str   (can contain safe HTML)
#   body_plain : callable(context) → str   (plain text fallback)
#   cta_url    : callable(context) → str | None
#   cta_label  : callable(context) → str

EMAIL_TEMPLATES = {

    # ── 1. Email / OTP Verified ──────────────────────────────────────────────
    'EMAIL_VERIFIED': {
        'subject': lambda c: "Email Verified ✓",
        'body_html': lambda c: (
            f"Your email has been successfully verified. "
            f"Your account is now active and ready to use."
        ),
        'body_plain': lambda c: (
            "Your email has been successfully verified. "
            "Your account is now active."
        ),
        'cta_url': lambda c: c.get('dashboard_url', f"{BASE_URL}"),
        'cta_label': lambda c: "Continue Setting Up Your Account →",
    },

    # ── 2. Account created but profile not set up ────────────────────────────
    'PROFILE_INCOMPLETE': {
        'subject': lambda c: "Welcome! Your Account is Ready",
        'body_html': lambda c: (
            f"Your account has been successfully created. "
            f"You're just a few steps away from being discoverable on The Social Market. "
            f"Complete your profile now to start connecting with "
            + ("brands." if c.get('signed_up_as') == 'influencer' else "influencers.")
        ),
        'body_plain': lambda c: (
            "Your account has been successfully created. "
            "Complete your profile to start connecting."
        ),
        'cta_url': lambda c: (
            f"{BASE_URL}/influencer-onboarding"
            if c.get('signed_up_as') in ('influencer', 'both')
            else f"{BASE_URL}/brand-onboarding"
        ),
        'cta_label': lambda c: "Complete My Profile →",
    },

    # ── 3. Password reset successful ─────────────────────────────────────────
    'PASSWORD_RESET_SUCCESS': {
        'subject': lambda c: "Password Reset Successful",
        'body_html': lambda c: (
            "Your password has been reset successfully. "
            "You can now log in with your new password. "
            "<br/><br/>"
            "If you did not request this change, please contact us immediately at "
            f'<a href="mailto:support@thesocialmarket.ai" style="color:#0f172a;">support@thesocialmarket.ai</a>.'
        ),
        'body_plain': lambda c: (
            "Your password has been reset successfully. "
            "If you did not request this change, contact support immediately."
        ),
        'cta_url': lambda c: f"{BASE_URL}/auth/login",
        'cta_label': lambda c: "Log In with New Password →",
    },

    # ── 4. Subscription activated / updated ─────────────────────────────────
    'SUBSCRIPTION_ACTIVATED': {
        'subject': lambda c: "Subscription Activated",
        'body_html': lambda c: (
            f"Your subscription has been updated to "
            f"<strong>{c.get('plan_name', 'your new plan')}</strong>. "
            f"You now have full access to all features included in this plan."
            + (
                "<br/><br/>To get the most out of your subscription, complete your profile so brands and influencers can find you."
                if c.get('plan_name') in ('Both', 'Micro-Influencer', 'Businesses') else ""
            )
        ),
        'body_plain': lambda c: (
            f"Your subscription has been updated to {c.get('plan_name', 'your new plan')}. "
            "You now have full access."
        ),
        'cta_url': lambda c: (
            f"{BASE_URL}/influencer-dashboard"
            if c.get('signed_up_as') in ('influencer', 'both')
            else f"{BASE_URL}/brand-dashboard"
        ),
        'cta_label': lambda c: "Go to My Dashboard →",
    },

    # ── 5. Proposal sent confirmation (to the brand) ─────────────────────────
    'PROPOSAL_SENT_BRAND': {
        'subject': lambda c: "Proposal Sent",
        'body_html': lambda c: (
            f"Your hire proposal to <strong>{c.get('influencer_name', 'the influencer')}</strong> "
            f"has been sent successfully."
            f"<br/><br/>You'll be notified as soon as they respond. "
            f"In the meantime, you can track all your proposals from your dashboard."
        ),
        'body_plain': lambda c: (
            f"Your hire proposal to {c.get('influencer_name', 'the influencer')} has been sent. "
            "You'll be notified when they respond."
        ),
        'cta_url': lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        'cta_label': lambda c: "Track Your Proposals →",
    },

    # ── 6a. Influencer accepted proposal (to brand) ──────────────────────────
    'PROPOSAL_ACCEPTED_BRAND': {
        'subject': lambda c: f"Proposal Accepted: {c.get('influencer_name', 'Influencer')}",
        'body_html': lambda c: (
            f"Your hire proposal for <strong>{c.get('influencer_name', 'the influencer')}</strong> "
            f"on campaign <strong>{c.get('campaign_name', 'your campaign')}</strong> was "
            f"<strong style='color:#16a34a;'>Accepted</strong>. "
            f"<br/><br/>Head to your dashboard to view the details and next steps."
        ),
        'body_plain': lambda c: (
            f"Your hire proposal for {c.get('influencer_name')} on "
            f"'{c.get('campaign_name')}' was Accepted."
        ),
        'cta_url': lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        'cta_label': lambda c: "View Campaign Details →",
    },

    # ── 6b. Influencer declined proposal (to brand) ──────────────────────────
    'PROPOSAL_REJECTED_BRAND': {
        'subject': lambda c: f"Proposal Declined: {c.get('influencer_name', 'Influencer')}",
        'body_html': lambda c: (
            f"Your hire proposal for <strong>{c.get('influencer_name', 'the influencer')}</strong> "
            f"on campaign <strong>{c.get('campaign_name', 'your campaign')}</strong> was "
            f"<strong style='color:#dc2626;'>Declined</strong>. "
            f"<br/><br/>Don't worry — there are many great influencers waiting to collaborate. "
            f"Browse and send new proposals from your dashboard."
        ),
        'body_plain': lambda c: (
            f"Your hire proposal for {c.get('influencer_name')} on "
            f"'{c.get('campaign_name')}' was Declined."
        ),
        'cta_url': lambda c: f"{BASE_URL}/brand-dashboard/microinfluencerspage",
        'cta_label': lambda c: "Find More Influencers →",
    },

    # ── 7. New hire proposal received (to influencer) ────────────────────────
    'PROPOSAL_RECEIVED_INFLUENCER': {
        'subject': lambda c: "New Proposal Received",
        'body_html': lambda c: (
            f"You have received a hire proposal from "
            f"<strong>{c.get('brand_name', 'a brand')}</strong>. "
            f"<br/><br/>Review the proposal details, budget, and campaign deliverables — "
            f"then accept or decline from your dashboard."
        ),
        'body_plain': lambda c: (
            f"You have received a hire proposal from {c.get('brand_name', 'a brand')}. "
            "Log in to view and respond."
        ),
        'cta_url': lambda c: f"{BASE_URL}/influencer-dashboard/campaigns",
        'cta_label': lambda c: "View and Respond →",
    },

    # ── 8. Unread notification reminder ─────────────────────────────────────
    'UNREAD_NOTIFICATIONS': {
        'subject': lambda c: f"You have {c.get('unread_count', 'unread')} unread notifications",
        'body_html': lambda c: (
            f"You have <strong>{c.get('unread_count', 'several')}</strong> unread "
            f"notification{'s' if int(c.get('unread_count', 0)) != 1 else ''} waiting for you on The Social Market. "
            f"<br/><br/>Stay on top of your proposals, messages, and campaign updates."
        ),
        'body_plain': lambda c: (
            f"You have {c.get('unread_count', 'unread')} unread notifications. "
            "Log in to view them."
        ),
        'cta_url': lambda c: (
            f"{BASE_URL}/influencer-dashboard"
            if c.get('signed_up_as') in ('influencer', 'both')
            else f"{BASE_URL}/brand-dashboard"
        ),
        'cta_label': lambda c: f"View My Notifications →",
    },

    # ── 9. Influencer assigned to campaign ──────────────────────────────────
    'INFLUENCER_ASSIGNED': {
        'subject': lambda c: f"Influencer Assigned: {c.get('campaign_name', 'Your Campaign')}",
        'body_html': lambda c: (
            f"<strong>{c.get('influencer_name', 'An influencer')}</strong> has been assigned to "
            f"your campaign <strong>{c.get('campaign_name', 'your campaign')}</strong>. "
            f"<br/><br/>You can now message them, review deliverables, and track progress from your dashboard."
        ),
        'body_plain': lambda c: (
            f"{c.get('influencer_name', 'An influencer')} has been assigned to "
            f"your campaign '{c.get('campaign_name')}'. Log in to view."
        ),
        'cta_url': lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        'cta_label': lambda c: "View Campaign Status →",
    },

    # ── 10. New match for brands ─────────────────────────────────────────────
    'MATCH_FOUND_BRAND': {
        'subject': lambda c: "New Match! 🎯",
        'body_html': lambda c: (
            f"An influencer that could be perfect for your next campaign just joined The Social Market. "
            f"<br/><br/>"
            + (
                f"<strong>{c.get('influencer_name')}</strong> specialises in "
                f"<strong>{c.get('niche', 'your target niche')}</strong> "
                f"and has over <strong>{c.get('follower_count', 'thousands of')}</strong> followers."
                f"<br/><br/>Don't miss out — reach out before anyone else does."
                if c.get('influencer_name')
                else "Don't miss out — view their profile before anyone else does."
            )
        ),
        'body_plain': lambda c: (
            "An influencer that matches your needs just joined The Social Market. "
            "Check their profile before anyone else does."
        ),
        'cta_url': lambda c: (
            f"{BASE_URL}/brand-dashboard/microinfluencerspage/{c['influencer_user_id']}"
            if c.get('influencer_user_id')
            else f"{BASE_URL}/brand-dashboard/microinfluencerspage"
        ),
        'cta_label': lambda c: "View Their Profile →",
    },

    # ── 11. New match for influencers ────────────────────────────────────────
    'MATCH_FOUND_INFLUENCER': {
        'subject': lambda c: "New Match! ✨",
        'body_html': lambda c: (
            f"A brand that matches your vibe just joined The Social Market. "
            f"<br/><br/>"
            + (
                f"<strong>{c.get('brand_name')}</strong> is looking for creators in "
                f"<strong>{c.get('niche', 'your niche')}</strong>. "
                f"<br/><br/>Check them out before anyone else does and message them to start your next collab."
                if c.get('brand_name')
                else "Check them out before anyone else does."
            )
        ),
        'body_plain': lambda c: (
            "A brand that matches your vibe just joined The Social Market. "
            "Message them and start your next collab."
        ),
        'cta_url': lambda c: (
            f"{BASE_URL}/influencer-dashboard/brand/{c['brand_user_id']}"
            if c.get('brand_user_id')
            else f"{BASE_URL}/influencer-dashboard/brand"
        ),
        'cta_label': lambda c: "View Their Profile →",
    },

    # ── 12. Campaign completed (to influencer) ───────────────────────────────
    'CAMPAIGN_COMPLETED_INFLUENCER': {
        'subject': lambda c: "Your Campaign is Complete 🎉",
        'body_html': lambda c: (
            f"The brand has marked your campaign "
            f"<strong>{c.get('campaign_name', '')}</strong> as complete. "
            f"<br/><br/>Your earnings have been recorded. "
            f"Log in to view your completed campaigns and leave a review."
        ),
        'body_plain': lambda c: (
            f"Your campaign '{c.get('campaign_name', '')}' has been marked complete. "
            "Log in to view your earnings."
        ),
        'cta_url': lambda c: f"{BASE_URL}/influencer-dashboard",
        'cta_label': lambda c: "View My Dashboard →",
    },
}
