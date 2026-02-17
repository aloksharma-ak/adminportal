import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
    </main>
  );
}
