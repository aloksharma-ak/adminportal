import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseApiUrl = process.env.API_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        orgId: { label: "OrgId", type: "text" },
      },

      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;
        const orgId = Number(credentials?.orgId);

        if (!baseApiUrl) return null;
        if (!username || !password) return null;
        if (!Number.isFinite(orgId) || orgId <= 0) return null;

        const res = await fetch(`${baseApiUrl}/api/Login/validate`, {
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

        const body = await res.json();

        const profileId = Number(body?.data?.profileId);
        const userName = String(body?.data?.userName);

        return {
          id: String(profileId),
          profileId,
          userName,
          orgId,
        };
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
