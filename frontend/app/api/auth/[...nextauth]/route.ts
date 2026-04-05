import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import { buildApiUrl } from "@/lib/backendUrls";

type CredentialsUser = User & {
  backendAccessToken?: string;
  backendRefreshToken?: string;
  role?: string;
};

const isSecureCookie = process.env.NODE_ENV === "production";
const cookieSameSite = isSecureCookie ? "none" : "lax";
const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production" ? "local-dev-secret" : undefined);

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendAccessToken?: string;
    backendRefreshToken?: string;
    role?: string;
    provider?: string;
  }
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password required");
      }

      try {
        const backendUrl = buildApiUrl("user_service/login/");
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        });
        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Invalid credentials");
        }

        const userData = data.data;
        return {
          id: String(userData.user?.id || userData.id || ""),
          email: credentials.email,
          name: `${userData.user?.first_name || ""} ${userData.user?.last_name || ""}`.trim(),
          backendAccessToken: userData.access_token,
          backendRefreshToken: userData.refresh_token,
          role: userData.signed_up_as || "influencer",
        };
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Failed to log in";
        throw new Error(msg);
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: { timeout: 10000 },
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
      authorization: { params: { scope: "name email", response_mode: "form_post" } },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  secret: nextAuthSecret,
  debug: false,

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: cookieSameSite,
        path: "/",
        secure: isSecureCookie,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: { sameSite: cookieSameSite, path: "/", secure: isSecureCookie },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: { sameSite: cookieSameSite, path: "/", secure: isSecureCookie },
    },
  },

  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && (account.provider === "google" || account.provider === "apple")) {
        try {
          const cookieStore = await cookies();
          const role = cookieStore.get("signup_role")?.value || "influencer";
          token.provider = account.provider;

          const email = user?.email || token.email;
          if (!email) return token;

          const payload: Record<string, unknown> = {
            email,
            signed_up_as: role,
            provider: account.provider,
          };

          if (account.provider === "google" && profile) {
            const googleProfile = profile as Record<string, string>;
            payload.first_name = googleProfile.given_name || googleProfile.name?.split(" ")[0] || "";
            payload.last_name = googleProfile.family_name || googleProfile.name?.split(" ")[1] || "";
          }

          if (account.provider === "apple") {
            payload.apple_id = profile?.sub || token.sub;

            if (user?.name) {
              const parts = user.name.split(" ");
              payload.first_name = parts[0] || "";
              payload.last_name = parts.slice(1).join(" ");
            } else {
              payload.first_name = "Name";
              payload.last_name = "";
            }
          }

          const backendUrl = buildApiUrl("user_service/social_signup_signin/");
          const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Backend rejected social login");
          }

          const accessToken = data.data?.access_token || data.access_token;
          const refreshToken = data.data?.refresh_token || data.refresh_token;

          if (accessToken) {
            token.backendAccessToken = accessToken;
            token.backendRefreshToken = refreshToken;
            token.role = role;
          }
        } catch (error) {
          throw error;
        }
      } else if (user) {
        const credentialsUser = user as CredentialsUser;

        if (credentialsUser.backendAccessToken) {
          token.backendAccessToken = credentialsUser.backendAccessToken;
          token.backendRefreshToken = credentialsUser.backendRefreshToken;
          token.role = credentialsUser.role;
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.backendAccessToken) {
        session.accessToken = token.backendAccessToken;
        (session as Session & { refreshToken?: string }).refreshToken = token.backendRefreshToken;

        if (session.user) {
          session.user.role = token.role;
        }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
