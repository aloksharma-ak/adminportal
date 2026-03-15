import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner circle with track */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-100 dark:border-slate-800" />
          <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        
        {/* Subtle label */}
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Fetching data...
        </p>
      </div>

      {/* Optional skeleton-like placeholder grid */}
      <div className="mt-12 w-full max-w-5xl px-4 opacity-20 pointer-events-none select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
