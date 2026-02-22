"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar } from "@/components/shared-ui/avatar";

type Props = {
  initials: string;
  profilePicture?: string | null;
  firstName?: string;
  lastName?: string;
  doLogout: () => void;
  username: string;
  brandColor?: string | null;
};

export default function NavProfileCard({
  initials,
  profilePicture,
  firstName,
  lastName,
  doLogout,
  username,
  brandColor,
}: Props) {
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || username;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-all hover:ring-2 hover:ring-offset-1 focus-visible:outline-none focus-visible:ring-2"
          style={{ "--tw-ring-color": brandColor ?? "#3b82f6" } as React.CSSProperties}
          aria-label="Open user menu"
        >
          <Avatar
            src={profilePicture}
            firstName={firstName}
            lastName={lastName}
            initials={initials}
            size="sm"
            brandColor={brandColor}
            className="cursor-pointer"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
      >
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={profilePicture}
              firstName={firstName}
              lastName={lastName}
              initials={initials}
              size="sm"
              brandColor={brandColor}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                @{username}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/users/profile" className="cursor-pointer rounded-xl">
            My Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer rounded-xl">
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={doLogout}
          className="cursor-pointer rounded-xl text-red-600 focus:text-red-600 dark:text-red-400"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
