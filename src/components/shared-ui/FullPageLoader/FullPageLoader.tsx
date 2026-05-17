"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FullPageLoader({
  label = "Loading Portal",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/85 backdrop-blur-md dark:bg-slate-950/85 transition-opacity duration-300",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        {label && (
          <p className="text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400 animate-pulse">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
