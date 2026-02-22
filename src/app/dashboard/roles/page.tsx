import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRoles } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Shield, Users } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard, EmptyState } from "@/components/shared-ui/states";

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let roles: Awaited<ReturnType<typeof getRoles>>["data"] = [];
  let fetchError: string | null = null;

  try {
    const res = await getRoles();
    roles = Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load roles";
  }

  const gradients = [
    "from-blue-500 to-indigo-500",
    "from-emerald-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-rose-500 to-pink-500",
    "from-orange-500 to-amber-500",
    "from-sky-500 to-cyan-500",
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title="Roles & Permissions"
        description="Select a role to view and manage its permissions"
        backHref="/dashboard"
        backLabel="Back to Dashboard"
      />

      {fetchError && <ErrorCard message={fetchError} />}

      {!fetchError && roles.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No roles configured"
          description="No roles have been set up for this organisation yet."
        />
      )}

      {!fetchError && roles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, idx) => {
            const gradient = gradients[idx % gradients.length];
            return (
              <Link key={role.roleId} href={`/dashboard/roles/${role.roleId}`} className="group">
                <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-slate-900/50">
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${gradient}`}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {role.roleName}
                      </h3>
                      <Badge variant="outline" className="mt-1 text-xs text-slate-500">
                        ID: {role.roleId}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users className="h-3 w-3" />
                        View permissions
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
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
