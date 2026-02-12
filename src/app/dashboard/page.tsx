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
  GraduationCap,
  ClipboardList,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllowModules } from "../utils";

type AllowedModule = {
  moduleId: number;
  moduleName: string;
  icon: string | null;
};

const iconMap: Record<string, LucideIcon> = {
  users: Users,

  academics: GraduationCap,

  admission: ClipboardList,

  leads: Megaphone,
  enquiries: Megaphone,

  fees: Wallet,
  reports: BarChart3,

  megaphone: Megaphone,
  wallet: Wallet,
  calendardays: CalendarDays,
  barchart3: BarChart3,
  arrowright: ArrowRight,
};

function normalizeKey(v?: string | null) {
  return (v ?? "").replace(/\s+/g, "").toLowerCase();
}

function getIconByName(
  iconName?: string | null,
  moduleName?: string | null,
): LucideIcon {
  // 1) prefer icon from DB if present
  const iconKey = normalizeKey(iconName);
  if (iconKey && iconMap[iconKey]) return iconMap[iconKey];

  // 2) fallback to module name mapping
  const nameKey = normalizeKey(moduleName);
  if (nameKey && iconMap[nameKey]) return iconMap[nameKey];

  // 3) default
  return LayoutGrid;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const allowedModule = await getAllowModules({ orgId: session.user.orgId });

  const modules: AllowedModule[] = Array.isArray(allowedModule?.data)
    ? allowedModule.data
    : [];

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Quick access to your modules.
          </p>
        </div>

        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-600">
              No modules assigned to this organisation.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {modules.map((module) => {
              const IconComp = getIconByName(module.icon, module.moduleName);
              const href = `/dashboard/module/${module.moduleId}`;

              return (
                <Link key={module.moduleId} href={href} className="group">
                  {/* TILE CARD (square) */}
                  <Card className="aspect-square transition hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border bg-slate-50">
                          <IconComp className="h-5 w-5 text-slate-700" />
                        </div>

                        <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {module.moduleName}
                        </CardTitle>
                      </div>

                      <CardContent className="px-0 pb-0">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                          Open
                          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </div>
                      </CardContent>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
