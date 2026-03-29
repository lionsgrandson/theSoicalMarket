// middleware.ts  — place this at the PROJECT ROOT (same level as package.json)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED = ["/brand-dashboard", "/influencer-dashboard", "/home_dashboard"];
const AUTH_PAGES = ["/auth"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  let hasNextAuthSession = false;
  try {
    hasNextAuthSession = Boolean(
      await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    );
  } catch {
    hasNextAuthSession = false;
  }

  const isAuthenticated = hasNextAuthSession;

  // Logged-in user trying to reach an auth page — send to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/home_dashboard", req.url));
  }

  // No token trying to reach a protected page — send to login
  if (!isAuthenticated && isProtected) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/brand-dashboard/:path*",
    "/influencer-dashboard/:path*",
    "/home_dashboard/:path*",
    "/auth/:path*",
  ],
};
