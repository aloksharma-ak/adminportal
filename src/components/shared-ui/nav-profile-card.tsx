"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toImageSrc } from "@/lib/image-session.client";

type Props = {
  initials: string;
  profilePicture?: string | null;
  doLogout: () => void;
  username: string;
};

export default function NavProfileCard({
  initials,
  profilePicture,
  doLogout,
  username,
}: Props) {
  const imgSrc = toImageSrc(profilePicture);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white/70 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-blue-200 dark:hover:bg-white/10"
          aria-label="Open user menu"
        >
          {imgSrc ? (
            <Image
              alt="profile"
              src={imgSrc}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              unoptimized={imgSrc.startsWith("data:image/")} // helps for base64/data urls
            />
          ) : (
            <div className="text-2xl font-bold leading-none">{initials}</div>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80"
      >
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {/* optional: display name here */}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            @{username}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

        <DropdownMenuItem asChild>
          <Link href="/user/profile" className="cursor-pointer rounded-xl">
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer rounded-xl">
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />

        <DropdownMenuItem
          onClick={doLogout}
          className="cursor-pointer rounded-xl text-red-700 focus:text-red-700 dark:text-red-300 dark:focus:text-red-300"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
