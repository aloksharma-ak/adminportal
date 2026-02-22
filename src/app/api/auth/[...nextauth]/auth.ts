import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_API_URL = process.env.API_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        orgId: { label: "OrgId", type: "text" },
        orgCode: { label: "OrgCode", type: "text" },
        orgName: { label: "OrgName", type: "text" },
        brandColor: { label: "BrandColor", type: "text" },
      },

      async authorize(credentials) {
        if (!BASE_API_URL) {
          console.error("[auth] API_URL env var is not set");
          return null;
        }

        const username = credentials?.username?.trim();
        const password = credentials?.password;
        const orgId = Number(credentials?.orgId);
        const orgCode = credentials?.orgCode?.trim().toUpperCase();
        const orgName = credentials?.orgName?.trim();
        const brandColor = credentials?.brandColor?.trim();

        if (!username || !password) return null;
        if (!Number.isFinite(orgId) || orgId <= 0) return null;

        try {
          const res = await fetch(`${BASE_API_URL}/api/Login/Validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requestGuid: crypto.randomUUID(),
              requestTime: new Date().toISOString(),
              username,
              password,
              orgId,
            }),
          });

          if (!res.ok) return null;

          // The backend may return:
          // 1. JSON object: { status: true, data: { profileId, userName } }
          // 2. Plain string: "Login successful"
          // Handle both gracefully.
          let profileId = 0;
          let userName = username;

          const contentType = res.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            const body = await res.json().catch(() => null);
            if (body && typeof body === "object") {
              const data = body?.data ?? body;
              profileId = Number(data?.profileId ?? body?.profileId ?? 0);
              userName = String(
                data?.userName ?? data?.username ?? body?.userName ?? username,
              );
            }
          }
          // else: plain-text response — profileId stays 0

          // If the API doesn't return profileId yet, fall back to orgId so
          // the session token is always valid (non-zero).
          if (!Number.isFinite(profileId) || profileId <= 0) {
            profileId = orgId;
          }

          return {
            id: String(profileId),
            profileId,
            userName,
            orgId,
            orgCode,
            orgName,
            brandColor,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },

    async session({ session, token }) {
      if (token.user) session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: Number(process.env.NEXTAUTH_MAX_AGE ?? 60 * 60 * 24 * 7),
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/login",
  },
};
