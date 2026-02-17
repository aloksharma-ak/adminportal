"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { clearImageFromSession } from "@/lib/image-session.client";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    clearImageFromSession();
    void signOut({ callbackUrl: "/auth/login", redirect: true });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Signing you out...
        </p>
      </div>
    </main>
  );
}
