import type { DefaultSession } from "next-auth";

export type AppUser = {
  id: string;
  profileId: number;
  userName: string;
  orgId: number;
  orgCode?: string;
  orgName?: string;
  brandColor?: string;
};

declare module "next-auth" {
  interface User extends AppUser {}

  interface Session {
    user: AppUser & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser;
  }
}
