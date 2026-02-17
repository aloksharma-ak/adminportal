import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRoles } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Shield } from "lucide-react";

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

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Roles & Permissions
        </h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Select a role to view and manage its permissions
        </p>
      </div>

      {fetchError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              {fetchError}
            </p>
          </CardContent>
        </Card>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">
              No roles configured for this organisation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <Link
              key={role.roleId}
              href={`/dashboard/roles/${role.roleId}`}
              className="group"
            >
              <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                      <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {role.roleName}
                    </CardTitle>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5" />
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-xs text-slate-500">
                    Role ID: {role.roleId}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
