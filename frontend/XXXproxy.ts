
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const cookieToken = request.cookies.get("access_token")?.value;
  const userCookie = request.cookies.get("user_info")?.value;

  let userData: {
    id: number;
    role: "brand" | "influencer" | "both";
    plan?: string | null;
    isBrandComplete: boolean;
    isInfluencerComplete: boolean;
  } | null = null;

  if (userCookie) {
    try {
      userData = JSON.parse(userCookie);
    } catch (error) {
      console.error("Failed to parse user_info cookie", error);
    }
  }

  const accessToken =
    cookieToken ||
    (typeof nextAuthToken?.backendAccessToken === "string"
      ? nextAuthToken.backendAccessToken
      : null);

  console.log("Cookie token:", cookieToken);
  console.log("NextAuth backend token:", nextAuthToken?.backendAccessToken);
  console.log("Final accessToken:", accessToken);

  // Must be authenticated
  if (!accessToken) {
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}subscription_service/get_user_subscription_information/`;
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(`Subscription API failed with status: ${res.status}`);
      url.pathname = "/subscription-required";
      url.searchParams.set("message", "Unable to verify subscription status");
      return NextResponse.redirect(url);
    }

    const subRes = await res.json();
    const planName = subRes?.data?.plan_name;
    const isActive = subRes?.data?.status === "active";
    const isFailure = subRes?.status === "failure";

    console.log(`Subscription check - Plan: ${planName}, Active: ${isActive}`);

    // Early fatal subscription failure
    if (isFailure) {
      url.pathname = "/subscription-required";
      url.searchParams.set("message", "No active subscription found");
      return NextResponse.redirect(url);
    }

    // ────────────────────────────────────────────────
    // UNIFIED ONBOARDING CHECK FOR BOTH DASHBOARDS
    // ────────────────────────────────────────────────
    const role = userData?.role;
    const isBrandComplete = userData?.isBrandComplete ?? false;
    const isInfluencerComplete = userData?.isInfluencerComplete ?? false;

    const isOnboardingComplete =
      role === "brand"      ? isBrandComplete :
      role === "influencer" ? isInfluencerComplete :
      role === "both"       ? (isBrandComplete && isInfluencerComplete) :
      /* else */              false;

    // Protect BOTH dashboards with one check
    if (
      (pathname.startsWith("/brand-dashboard") ||
       pathname.startsWith("/influencer-dashboard")) &&
      !isOnboardingComplete
    ) {
      url.pathname = "/home_dashboard";
      url.searchParams.set("reason", "onboarding_incomplete");
      return NextResponse.redirect(url);
    }

    // ────────────────────────────────────────────────
    // ORIGINAL SUBSCRIPTION + ONBOARDING PAGE PROTECTION
    // ────────────────────────────────────────────────

    /* ------------- BRAND ONBOARDING -------------- */
    if (pathname.startsWith("/brand-onboarding")) {
      if (!isActive) {
        url.pathname = "/brand-subscription-required";
        url.searchParams.set("reason", "subscription_inactive");
        return NextResponse.redirect(url);
      }
    }

    /* ----------- INFLUENCER ONBOARDING ------------ */
    if (pathname.startsWith("/influencer-onboarding")) {
      if (!isActive) {
        url.pathname = "/influencer-subscription-required";
        url.searchParams.set("reason", "subscription_inactive");
        return NextResponse.redirect(url);
      }
    }

    /* ---------------- BRAND DASHBOARD ---------------- */
    if (pathname.startsWith("/brand-dashboard")) {
      const hasValidBrandPlan = isActive && (planName === "Brand" || planName === "Both");

      if (!hasValidBrandPlan) {
        url.pathname = "/brand-subscription-required";
        if (!isActive) {
          url.searchParams.set("reason", "subscription_inactive");
        } else if (planName === "Influencer") {
          url.searchParams.set("reason", "wrong_plan_type");
        } else {
          url.searchParams.set("reason", "no_subscription");
        }
        return NextResponse.redirect(url);
      }
    }

    /* ------------- INFLUENCER DASHBOARD -------------- */
    if (pathname.startsWith("/influencer-dashboard")) {
      const hasValidInfluencerPlan = isActive && (planName === "Influencer" || planName === "Both");

      if (!hasValidInfluencerPlan) {
        url.pathname = "/influencer-subscription-required";
        if (!isActive) {
          url.searchParams.set("reason", "subscription_inactive");
        } else if (planName === "Brand") {
          url.searchParams.set("reason", "wrong_plan_type");
        } else {
          url.searchParams.set("reason", "no_subscription");
        }
        return NextResponse.redirect(url);
      }
    }

    // All checks passed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    url.pathname = "/subscription-error";
    url.searchParams.set("message", "System error checking subscription");
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/brand-dashboard/:path*",
    "/influencer-dashboard/:path*",
    "/brand-onboarding/:path*",
    "/influencer-onboarding/:path*",
  ],
};