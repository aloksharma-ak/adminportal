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
  LayoutGrid,
  GraduationCap,
  ClipboardList,
  Shield,
  type LucideIcon,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllowModules } from "../utils";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type AllowedModule = {
  moduleId: number;
  moduleName: string;
  icon: string | null;
};

// ─────────────────────────────────────────────────────────
// Module → route + icon mapping
// ─────────────────────────────────────────────────────────

type ModuleConfig = {
  href: string;
  Icon: LucideIcon;
};

const MODULE_MAP: Record<string, ModuleConfig> = {
  users: { href: "/dashboard/users", Icon: Users },
  user: { href: "/dashboard/users", Icon: Users },
  academics: { href: "/dashboard/academics", Icon: GraduationCap },
  admission: { href: "/dashboard/admission", Icon: ClipboardList },
  admissions: { href: "/dashboard/admission", Icon: ClipboardList },
  leads: { href: "/dashboard/leads", Icon: Megaphone },
  enquiries: { href: "/dashboard/enquiries", Icon: Megaphone },
  fees: { href: "/dashboard/fees", Icon: Wallet },
  reports: { href: "/dashboard/reports", Icon: BarChart3 },
  roles: { href: "/dashboard/roles", Icon: Shield },
  rolepermission: { href: "/dashboard/roles", Icon: Shield },
  schedule: { href: "/dashboard/schedule", Icon: CalendarDays },
  timetable: { href: "/dashboard/timetable", Icon: CalendarDays },
};

function normalizeKey(v?: string | null): string {
  return (v ?? "").replace(/[\s_-]/g, "").toLowerCase();
}

function getModuleConfig(
  iconName?: string | null,
  moduleName?: string | null,
): ModuleConfig {
  const byIcon = MODULE_MAP[normalizeKey(iconName)];
  if (byIcon) return byIcon;
  const byName = MODULE_MAP[normalizeKey(moduleName)];
  if (byName) return byName;
  // Fallback: generate slug from module name
  const slug = (moduleName ?? "").toLowerCase().replace(/\s+/g, "-");
  return { href: `/dashboard/${slug}`, Icon: LayoutGrid };
}

// ─────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let modules: AllowedModule[] = [];
  try {
    const result = await getAllowModules({ orgId: session.user.orgId });
    const payload = result?.data ?? result;
    modules = Array.isArray(payload?.modules)
      ? payload.modules
      : Array.isArray(payload)
        ? payload
        : [];
  } catch {
    modules = [];
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {greeting}, {session.user.userName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {modules.length > 0
            ? `You have access to ${modules.length} module${modules.length !== 1 ? "s" : ""}`
            : "Welcome to your dashboard"}
        </p>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutGrid className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              No modules are assigned to this organisation yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Contact your administrator to enable modules.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {modules.map((module) => {
            const { href, Icon } = getModuleConfig(
              module.icon,
              module.moduleName,
            );

            return (
              <Link key={module.moduleId} href={href} className="group">
                <Card className="aspect-square transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-slate-800">
                  <CardHeader className="flex h-full flex-col justify-between p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <CardTitle className="mb-1 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
                        {module.moduleName}
                      </CardTitle>
                      <CardContent className="px-0 pb-0 pt-0">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                          Open
                          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </CardContent>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
