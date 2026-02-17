import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee } from "@/app/utils";
import { Container } from "@/components/shared-ui/container";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Permission = {
  id?:          number | string;
  code?:        string;
  description?: string;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profileId || !session?.user?.orgId) {
    redirect("/auth/login");
  }

  const res = await getEmployee({
    profileId: session.user.profileId,
    orgId:     session.user.orgId,
  });

  const emp = res?.data;

  if (!res?.status || !emp) {
    return (
      <Container className="py-8">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {res?.message ?? "Employee record not found."}
        </p>
      </Container>
    );
  }

  const fullName = [emp.firstName, emp.middleName, emp.lastName]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const info: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Employee ID",    value: emp.empId           ?? "—" },
    { label: "Name",           value: fullName             || "—" },
    { label: "Initials",       value: emp.initials         ?? "—" },
    { label: "Phone",          value: emp.phone            ?? "—" },
    { label: "Secondary Phone",value: emp.secondaryPhone   || "—" },
    { label: "Email",          value: emp.email            || "—" },
    { label: "Role",           value: emp.role?.roleName   ?? "—" },
    { label: "PAN",            value: emp.panNo            || "—" },
    { label: "Aadhar",         value: emp.aadharNo         || "—" },
    { label: "Passport",       value: emp.passportNo       || "—" },
  ];

  const permissions: Permission[] = Array.isArray(emp.permissions) ? emp.permissions : [];

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </div>

      <h1 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        Employee Profile
      </h1>
      {res.message && (
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {res.message}
        </p>
      )}

      {/* Info table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full text-sm">
          <tbody>
            {info.map((row) => (
              <tr
                key={row.label}
                className="border-t border-slate-100 first:border-t-0 dark:border-slate-800"
              >
                <td className="w-48 bg-slate-50 px-4 py-3 font-medium text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions */}
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          Permissions
        </h2>

        {permissions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No permissions assigned.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, idx) => (
                  <tr
                    key={p.id ?? idx}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {p.code}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {p.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
