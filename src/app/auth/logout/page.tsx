"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { clearImageFromSession } from "@/lib/image-session.client";

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
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Logging you out...
      </div>
    </main>
  );
}
