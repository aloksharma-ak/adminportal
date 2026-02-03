// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Briefcase,
  Database,
  Euro,
  Factory,
  FileText,
  Puzzle,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";

type Tile = {
  title: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const tiles: Tile[] = [
  { title: "ACCOUNTING", href: "/dashboard/accounting", Icon: Euro },
  { title: "CRM", href: "/dashboard/crm", Icon: Puzzle },
  { title: "HR", href: "/dashboard/hr", Icon: Users },
  { title: "PROJECT", href: "/dashboard/project", Icon: Briefcase },
  { title: "INVENTORY", href: "/dashboard/inventory", Icon: Boxes },
  { title: "MANUFACTURING", href: "/dashboard/manufacturing", Icon: Factory },
  { title: "E-COMMERCE", href: "/dashboard/ecommerce", Icon: Store },
  { title: "PDM", href: "/dashboard/pdm", Icon: Database },
  { title: "KM", href: "/dashboard/km", Icon: FileText },
  { title: "POS", href: "/dashboard/pos", Icon: ShoppingBag },
  { title: "TRADE", href: "/dashboard/trade", Icon: BarChart3 },
  { title: "MORE", href: "/dashboard/more", Icon: ArrowRight },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  console.log("---->", session);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:px-8">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {tiles.map(({ title, href, Icon }) => (
              <Link
                key={title}
                href={href}
                className="group flex h-44 flex-col items-center justify-center rounded-md border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
              >
                <Icon className="h-16 w-16 text-slate-400 transition group-hover:text-slate-500" />
                <div className="mt-6 text-xs font-semibold tracking-[0.22em] text-slate-500">
                  {title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
