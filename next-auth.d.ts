import type { DefaultSession } from "next-auth";

export type AppUser = {
  id: string;
  profileId: number;
  userName: string;
  orgId: number;
};

declare module "next-auth" {
  interface User {
    id: string;
    profileId: number;
    userName: string;
    orgId: number;
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
