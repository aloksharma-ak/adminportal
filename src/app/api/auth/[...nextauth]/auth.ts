/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type BackendLoginOk = {
  responseTime: string;
  status: boolean;
  message: string;
  data?: string;
};

type BackendUser = {
  ProfileId: number;
  UserId: string;
  FirstName: string;
  LastName: string;
  UserName: string;
};

function safeJsonParse<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;

        if (!username || !password) return null;

        const apiUrl = process.env.API_URL;
        if (!apiUrl) throw new Error("API_URL missing");

        const res = await fetch(`${apiUrl}/api/Login/validate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestGuid: crypto.randomUUID(),
            requestTime: new Date().toISOString(),
            username,
            password,
          }),
        });

        const json = (await res.json()) as BackendLoginOk;

        if (!res.ok || !json?.status) return null;

        const u = safeJsonParse<BackendUser>(json.data);
        if (!u?.UserId) return null;

        return {
          id: u.UserId,
          userId: u.UserId,
          userName: u.UserName,
          firstName: u.FirstName,
          lastName: u.LastName,
          profileId: u.ProfileId,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user;
      return session;
    },
  },
};
