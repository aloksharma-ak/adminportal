import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Megaphone,
  Users,
  Wallet,
  LucideIcon,
  LayoutGrid,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ModuleItem = {
  ModuleId: number;
  ModuleName: string;
  Icon: string; // icon name from API/DB
};

const modules: ModuleItem[] = [
  { ModuleId: 1, ModuleName: "Leads & Enquiries", Icon: "Megaphone" },
  { ModuleId: 2, ModuleName: "Students", Icon: "Users" },
  { ModuleId: 3, ModuleName: "Fees", Icon: "Wallet" },
  { ModuleId: 4, ModuleName: "Schedule", Icon: "CalendarDays" },
  { ModuleId: 5, ModuleName: "Reports", Icon: "BarChart3" },
  { ModuleId: 6, ModuleName: "More", Icon: "ArrowRight" },
];

// ModuleId -> route mapping (description removed)
const moduleRouteMap: Record<number, string> = {
  1: "/dashboard/leads",
  2: "/dashboard/students",
  3: "/dashboard/fees",
  4: "/dashboard/schedule",
  5: "/dashboard/reports",
  6: "/dashboard/more",
};

const iconMap: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  users: Users,
  wallet: Wallet,
  calendardays: CalendarDays,
  barchart3: BarChart3,
  arrowright: ArrowRight,
};

function getIconByName(iconName: string): LucideIcon {
  const key = iconName.replace(/\s+/g, "").toLowerCase();
  return iconMap[key] ?? LayoutGrid;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quick access to your modules.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const IconComp = getIconByName(module.Icon);
            const href =
              moduleRouteMap[module.ModuleId] ??
              `/dashboard/module/${module.ModuleId}`;

            return (
              <Link key={module.ModuleId} href={href} className="group">
                <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">
                      {module.ModuleName}
                    </CardTitle>
                    <div className="grid h-10 w-10 place-items-center rounded-lg border bg-slate-50">
                      <IconComp className="h-5 w-5 text-slate-700" />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      Open
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
