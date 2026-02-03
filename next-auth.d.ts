import type { DefaultSession } from "next-auth";

export type AppUser = {
  id: string;
  profileId: number;
  userName: string;
  orgId: number;
  orgCode?: string;
};

declare module "next-auth" {
  interface User {
    id: string;
    profileId: number;
    userName: string;
    orgId: number;
    orgCode?: string;
  }

  interface Session {
    user: AppUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser;
  }
}
