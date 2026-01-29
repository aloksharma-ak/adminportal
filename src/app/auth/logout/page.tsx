"use client";

import * as React from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  React.useEffect(() => {
    signOut({ callbackUrl: "/auth/login" });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-sm text-slate-600 dark:text-slate-300">
        Logging you out...
      </div>
    </main>
  );
}
