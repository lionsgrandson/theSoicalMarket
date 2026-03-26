import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    googleUser?: {
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  }

  interface User extends DefaultUser {
    googleUser?: {
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleUser?: {
      email?: string;
      first_name?: string;
      last_name?: string;
    };
  }
}

