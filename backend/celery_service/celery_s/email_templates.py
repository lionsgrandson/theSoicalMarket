import os

BASE_URL = os.environ.get("SITE_BASE_URL", "https://thesocialmarket.ai").rstrip("/")

_BASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
  <style>
    body{{margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}}
    .wrapper{{width:100%;background:#f4f4f7;padding:32px 16px;box-sizing:border-box;}}
    .card{{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);}}
    .header{{background:#0f172a;padding:28px 36px;text-align:center;}}
    .header-text{{color:#fff;font-size:16px;font-weight:700;letter-spacing:0.04em;margin:0;}}
    .body{{padding:36px 36px 24px;}}
    .greeting{{font-size:18px;font-weight:600;color:#0f172a;margin:0 0 14px;}}
    .message{{font-size:15px;color:#374151;line-height:1.75;margin:0 0 28px;}}
    .cta{{display:block;width:fit-content;background:#facc15;color:#0f172a !important;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;margin:0 auto 10px;text-align:center;}}
    .cta-sub{{text-align:center;font-size:12px;color:#9ca3af;margin:0 0 24px;}}
    .divider{{height:1px;background:#f0f0f0;margin:24px 0;}}
    .sign{{font-size:14px;color:#374151;margin:0;}}
    .footer{{background:#f8fafc;padding:18px 36px;text-align:center;}}
    .footer p{{font-size:12px;color:#9ca3af;margin:4px 0;line-height:1.6;}}
    .footer a{{color:#6b7280;text-decoration:underline;}}
    @media(max-width:600px){{.body,.footer{{padding-left:20px;padding-right:20px;}}.cta{{width:100%;box-sizing:border-box;}}}}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header"><p class="header-text">THE SOCIAL MARKET</p></div>
      <div class="body">
        <p class="greeting">Dear {first_name},</p>
        <div class="message">{body}</div>
        {cta_block}
        <div class="divider"></div>
        <p class="sign">Best Regards,<br /><strong>The Social Market Team</strong></p>
      </div>
      <div class="footer">
        <p>You received this because you have an account at <a href="{base_url}">thesocialmarket.ai</a>.</p>
        <p><a href="{base_url}/settings/notifications">Manage notification preferences</a></p>
      </div>
    </div>
  </div>
</body>
</html>"""

_CTA_BLOCK = (
    '<a class="cta" href="{url}">{label}</a>'
    '<p class="cta-sub">Or visit: <a href="{url}" style="color:#6b7280">{url}</a></p>'
)


def _cta(url: str | None, label: str) -> str:
    if not url:
        return ""
    return _CTA_BLOCK.format(url=url, label=label)


def render_email(template_key: str, context: dict) -> tuple[str, str, str]:
    template = EMAIL_TEMPLATES[template_key]
    subject = template["subject"](context)
    body_html = template["body_html"](context)
    body_plain = template["body_plain"](context)
    cta_url = template.get("cta_url", lambda _ctx: None)(context)
    cta_label = template.get("cta_label", lambda _ctx: "")(context)

    html = _BASE_HTML.format(
        subject=subject,
        first_name=context.get("first_name", "there"),
        body=body_html,
        cta_block=_cta(cta_url, cta_label),
        base_url=BASE_URL,
    )
    plain = (
        f"Dear {context.get('first_name', 'there')},\n\n"
        f"{body_plain}\n\n"
        + (f"{cta_label}: {cta_url}\n\n" if cta_url else "")
        + "Best Regards,\nThe Social Market Team"
    )
    return subject, plain, html


EMAIL_TEMPLATES = {
    "EMAIL_VERIFIED": {
        "subject": lambda c: "Email Verified",
        "body_html": lambda c: "Your email has been successfully verified. Your account is now active and ready to use.",
        "body_plain": lambda c: "Your email has been successfully verified. Your account is now active.",
        "cta_url": lambda c: c.get(
            "dashboard_url",
            f"{BASE_URL}/{'influencer-dashboard' if c.get('signed_up_as') in ('influencer', 'both') else 'brand-dashboard'}",
        ),
        "cta_label": lambda c: "Open Dashboard",
    },
    "PROFILE_INCOMPLETE": {
        "subject": lambda c: "Welcome! Your Account is Ready",
        "body_html": lambda c: (
            "Your account has been successfully created. Complete your profile to start connecting with "
            + ("brands." if c.get("signed_up_as") in ("influencer", "both") else "influencers.")
        ),
        "body_plain": lambda c: "Your account has been successfully created. Complete your profile to start connecting.",
        "cta_url": lambda c: (
            f"{BASE_URL}/influencer-onboarding"
            if c.get("signed_up_as") in ("influencer", "both")
            else f"{BASE_URL}/brand-onboarding"
        ),
        "cta_label": lambda c: "Complete My Profile",
    },
    "PASSWORD_RESET_SUCCESS": {
        "subject": lambda c: "Password Reset Successful",
        "body_html": lambda c: (
            "Your password has been reset successfully. If you did not request this change, contact "
            '<a href="mailto:support@thesocialmarket.ai" style="color:#0f172a;">support@thesocialmarket.ai</a> immediately.'
        ),
        "body_plain": lambda c: "Your password has been reset successfully. If you did not request this change, contact support immediately.",
        "cta_url": lambda c: f"{BASE_URL}/auth/login",
        "cta_label": lambda c: "Log In",
    },
    "SUBSCRIPTION_ACTIVATED": {
        "subject": lambda c: "Subscription Activated",
        "body_html": lambda c: f"Your subscription is now active on the <strong>{c.get('plan_name', 'current')}</strong> plan.",
        "body_plain": lambda c: f"Your subscription is now active on the {c.get('plan_name', 'current')} plan.",
        "cta_url": lambda c: (
            f"{BASE_URL}/influencer-dashboard"
            if c.get("signed_up_as") in ("influencer", "both")
            else f"{BASE_URL}/brand-dashboard"
        ),
        "cta_label": lambda c: "Go to Dashboard",
    },
    "PROPOSAL_SENT_BRAND": {
        "subject": lambda c: "Proposal Sent",
        "body_html": lambda c: f"Your hire proposal to <strong>{c.get('influencer_name', 'the influencer')}</strong> has been sent successfully.",
        "body_plain": lambda c: f"Your hire proposal to {c.get('influencer_name', 'the influencer')} has been sent successfully.",
        "cta_url": lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        "cta_label": lambda c: "Track Proposals",
    },
    "PROPOSAL_RECEIVED_INFLUENCER": {
        "subject": lambda c: "New Proposal Received",
        "body_html": lambda c: f"You have received a hire proposal from <strong>{c.get('brand_name', 'a brand')}</strong>.",
        "body_plain": lambda c: f"You have received a hire proposal from {c.get('brand_name', 'a brand')}.",
        "cta_url": lambda c: f"{BASE_URL}/influencer-dashboard/campaigns",
        "cta_label": lambda c: "View Proposal",
    },
    "PROPOSAL_ACCEPTED_BRAND": {
        "subject": lambda c: f"Proposal Accepted: {c.get('influencer_name', 'Influencer')}",
        "body_html": lambda c: (
            f"<strong>{c.get('influencer_name', 'The influencer')}</strong> accepted your proposal"
            + (
                f" for <strong>{c.get('campaign_name')}</strong>."
                if c.get("campaign_name")
                else "."
            )
        ),
        "body_plain": lambda c: (
            f"{c.get('influencer_name', 'The influencer')} accepted your proposal"
            + (f" for {c.get('campaign_name')}." if c.get("campaign_name") else ".")
        ),
        "cta_url": lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        "cta_label": lambda c: "View Campaign",
    },
    "INFLUENCER_ASSIGNED": {
        "subject": lambda c: f"Influencer Assigned: {c.get('campaign_name', 'Your Campaign')}",
        "body_html": lambda c: f"<strong>{c.get('influencer_name', 'An influencer')}</strong> has been assigned to your campaign.",
        "body_plain": lambda c: f"{c.get('influencer_name', 'An influencer')} has been assigned to your campaign.",
        "cta_url": lambda c: f"{BASE_URL}/brand-dashboard/campaigns",
        "cta_label": lambda c: "View Campaign Status",
    },
    "PROPOSAL_REJECTED_BRAND": {
        "subject": lambda c: f"Proposal Declined: {c.get('influencer_name', 'Influencer')}",
        "body_html": lambda c: (
            f"<strong>{c.get('influencer_name', 'The influencer')}</strong> declined your proposal"
            + (
                f" for <strong>{c.get('campaign_name')}</strong>."
                if c.get("campaign_name")
                else "."
            )
        ),
        "body_plain": lambda c: (
            f"{c.get('influencer_name', 'The influencer')} declined your proposal"
            + (f" for {c.get('campaign_name')}." if c.get("campaign_name") else ".")
        ),
        "cta_url": lambda c: f"{BASE_URL}/brand-dashboard/microinfluencerspage",
        "cta_label": lambda c: "Find More Influencers",
    },
    "MATCH_FOUND_BRAND": {
        "subject": lambda c: "New Match for Your Brand",
        "body_html": lambda c: (
            f"<strong>{c.get('influencer_name', 'A creator')}</strong> looks like a strong match"
            + (
                f" in <strong>{c.get('niche')}</strong>."
                if c.get("niche")
                else "."
            )
        ),
        "body_plain": lambda c: f"{c.get('influencer_name', 'A creator')} looks like a strong match for your brand.",
        "cta_url": lambda c: (
            f"{BASE_URL}/brand-dashboard/microinfluencerspage/{c['influencer_user_id']}"
            if c.get("influencer_user_id")
            else f"{BASE_URL}/brand-dashboard/microinfluencerspage"
        ),
        "cta_label": lambda c: "View Profile",
    },
    "MATCH_FOUND_INFLUENCER": {
        "subject": lambda c: "New Brand Match",
        "body_html": lambda c: (
            f"<strong>{c.get('brand_name', 'A brand')}</strong> looks like a strong match"
            + (
                f" in <strong>{c.get('niche')}</strong>."
                if c.get("niche")
                else "."
            )
        ),
        "body_plain": lambda c: f"{c.get('brand_name', 'A brand')} looks like a strong match for you.",
        "cta_url": lambda c: (
            f"{BASE_URL}/influencer-dashboard/brand/{c['brand_user_id']}"
            if c.get("brand_user_id")
            else f"{BASE_URL}/influencer-dashboard/brand"
        ),
        "cta_label": lambda c: "View Brand",
    },
    "UNREAD_NOTIFICATIONS": {
        "subject": lambda c: f"You have {c.get('unread_count', 0)} unread notifications",
        "body_html": lambda c: f"You have <strong>{c.get('unread_count', 0)}</strong> unread notifications waiting for you.",
        "body_plain": lambda c: f"You have {c.get('unread_count', 0)} unread notifications waiting for you.",
        "cta_url": lambda c: (
            f"{BASE_URL}/influencer-dashboard"
            if c.get("signed_up_as") in ("influencer", "both")
            else f"{BASE_URL}/brand-dashboard"
        ),
        "cta_label": lambda c: "View Notifications",
    },
    "CAMPAIGN_COMPLETED_INFLUENCER": {
        "subject": lambda c: "Your Campaign is Complete",
        "body_html": lambda c: (
            "The brand has marked your campaign as complete."
            + (f" Campaign: <strong>{c.get('campaign_name')}</strong>." if c.get("campaign_name") else "")
        ),
        "body_plain": lambda c: (
            "The brand has marked your campaign as complete."
            + (f" Campaign: {c.get('campaign_name')}." if c.get("campaign_name") else "")
        ),
        "cta_url": lambda c: f"{BASE_URL}/influencer-dashboard",
        "cta_label": lambda c: "Open Dashboard",
    },
}
