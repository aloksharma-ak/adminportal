import { Card, CardContent } from "@/components/ui/Card";
import { Landmark, Sparkles, Receipt, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

export default async function FeeDetailsComingSoonPage() {
  const session = await getServerSession(authOptions);
  const brandColor = session?.user?.brandColor ?? "#3b82f6";

  return (
    <div className="w-full">
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <CardContent className="flex flex-col items-center py-20 text-center px-6 md:px-12">
          {/* Decorative central illustration */}
          <div className="relative mb-8">
            {/* Soft glowing ambient circle */}
            <div
              className="absolute inset-0 -m-4 rounded-full opacity-15 blur-xl animate-pulse"
              style={{ backgroundColor: brandColor }}
            />
            {/* Visual Icon Box */}
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg transition-transform duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${brandColor}, ${brandColor}dd)`,
              }}
            >
              <Landmark className="h-10 w-10" />
            </div>
            {/* Small absolute indicator badge */}
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Heading content */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase shadow-sm mb-3 border"
            style={{
              borderColor: `${brandColor}40`,
              color: brandColor,
              backgroundColor: `${brandColor}08`,
            }}
          >
            Module Coming Soon
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Streamline Student Fee Management
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            We are working hard to build a comprehensive, automated fee collection engine. Soon you will be able to manage custom fee structures, track receipts, view outstanding dues, and generate instant digital invoices.
          </p>

          {/* Feature list preview cards */}
          <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2 text-left">
            <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: brandColor }}
              >
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Smart Invoicing</h4>
                <p className="mt-1 text-xs text-slate-500">Automated ledger generation and seamless digital receipts.</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: brandColor }}
              >
                <ArrowRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Dues & Overdues</h4>
                <p className="mt-1 text-xs text-slate-500">Instantly view dues, concessions, and track collection ratios.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
