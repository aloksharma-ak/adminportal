"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FullPageLoader({ 
  label = "Loading Portal",
  className 
}: { 
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 transition-colors duration-500",
      className
    )}>
      <div className="relative flex flex-col items-center">
        {/* Outer pulse */}
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-blue-500/10 dark:bg-blue-400/5" />
        
        {/* Spinning icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>

        {/* Text */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <p className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
            {label}
          </p>
          <div className="flex gap-1">
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-300 dark:bg-slate-700 [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-300 dark:bg-slate-700 [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
