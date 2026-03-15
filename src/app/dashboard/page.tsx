import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, BarChart3, CalendarDays, Megaphone, Users, Wallet,
  LayoutGrid, GraduationCap, ClipboardList, Shield, type LucideIcon,
} from "lucide-react";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { Card, CardContent } from "@/components/ui/card";
import { getAllowModules, getUser } from "../utils";
import { Avatar } from "@/components/shared-ui/avatar";
import { EmptyState } from "@/components/shared-ui/states";

type AllowedModule = { moduleId: number; moduleName: string; icon: string | null };
type ModuleConfig = { href: string; Icon: LucideIcon; gradient: string };

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  users: { href: "/dashboard/users", Icon: Users, gradient: "from-blue-500 to-indigo-500" },
  academics: { href: "/dashboard/academics", Icon: GraduationCap, gradient: "from-violet-500 to-purple-500" },
  admission: { href: "/dashboard/admission", Icon: ClipboardList, gradient: "from-emerald-500 to-teal-500" },
  leads: { href: "/dashboard/leads", Icon: Megaphone, gradient: "from-orange-500 to-amber-500" },
  fees: { href: "/dashboard/fees", Icon: Wallet, gradient: "from-yellow-500 to-lime-500" },
  reports: { href: "/dashboard/reports", Icon: BarChart3, gradient: "from-rose-500 to-pink-500" },
  roles: { href: "/dashboard/roles", Icon: Shield, gradient: "from-slate-500 to-zinc-500" },
  schedule: { href: "/dashboard/schedule", Icon: CalendarDays, gradient: "from-sky-500 to-cyan-500" },
};

const MODULE_ALIAS_MAP: Record<string, string> = {
  user: "users",
  admissions: "admission",
  enquiries: "leads",
  rolepermission: "roles",
  timetable: "schedule",
};

function getModuleConfig(iconName?: string | null, moduleName?: string | null): ModuleConfig {
  const normalize = (v?: string | null) => (v ?? "").replace(/[\s_-]/g, "").toLowerCase();
  const iconKey = normalize(iconName);
  const nameKey = normalize(moduleName);

  const key = MODULE_ALIAS_MAP[iconKey] || iconKey || MODULE_ALIAS_MAP[nameKey] || nameKey;

  return (
    MODULE_CONFIGS[key] ?? {
      href: `/dashboard/${(moduleName ?? "").toLowerCase().replace(/\s+/g, "-")}`,
      Icon: LayoutGrid,
      gradient: "from-slate-400 to-slate-500",
    }
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const [modulesResult, empResult] = await Promise.allSettled([
    getAllowModules({ orgId: session.user.orgId, userId: session.user.profileId }),
    getUser({ profileId: session.user.profileId, orgId: session.user.orgId }),
  ]);

  const rawModules = modulesResult.status === "fulfilled" ? modulesResult.value : null;
  const modulesPayload = rawModules?.data ?? rawModules;
  const modules: AllowedModule[] = Array.isArray(modulesPayload?.modules) ? modulesPayload.modules
    : Array.isArray(modulesPayload) ? modulesPayload : [];

  const emp = empResult.status === "fulfilled" ? empResult.value?.data?.details : null;
  const firstName = emp?.firstName ?? session.user.userName ?? "";
  const lastName = emp?.lastName ?? "";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            src={emp?.profilePicture}
            firstName={firstName}
            lastName={lastName}
            size="lg"
            brandColor={session.user.brandColor}
          />
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {greeting} 👋
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {[firstName, lastName].filter(Boolean).join(" ") || "Welcome"}
            </h1>
            {emp?.role?.roleName && (
              <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {emp.role.roleName}
              </span>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Organisation
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {session.user.orgName ?? session.user.orgCode}
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Your Modules
        </h2>
        {modules.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {modules.length} accessible
          </span>
        )}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No modules assigned"
          description="Contact your administrator to enable modules for this organisation."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {modules.map((module) => {
            const { href, Icon, gradient } = getModuleConfig(module.icon, module.moduleName);
            return (
              <Link key={module.moduleId} href={href} className="group">
                <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50">
                  <CardContent className="flex h-full flex-col justify-between p-5">
                    <div
                      className={`mb-3 grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br ${gradient} shadow-sm`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight text-slate-900 dark:text-slate-100 line-clamp-2">
                        {module.moduleName}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                        Open
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
