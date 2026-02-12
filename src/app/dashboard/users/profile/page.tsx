/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.profileId || !session?.user?.orgId)
    redirect("/auth/login");

  const res = await getEmployee({
    profileId: session.user.profileId,
    orgId: session.user.orgId,
  });

  const emp = res?.data; // <-- important

  if (!res?.status || !emp) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Employee not found</h1>
        <p className="text-sm text-slate-600">{res?.message ?? "No data"}</p>
      </div>
    );
  }

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Employee ID", value: emp.empId },
    {
      label: "Name",
      value:
        `${emp.firstName ?? ""} ${emp.middleName ?? ""} ${emp.lastName ?? ""}`
          .replace(/\s+/g, " ")
          .trim(),
    },
    { label: "Initials", value: emp.initials ?? "-" },
    { label: "Phone", value: emp.phone ?? "-" },
    { label: "Secondary Phone", value: emp.secondaryPhone || "-" },
    { label: "Email", value: emp.email || "-" },
    { label: "Profile ID", value: emp.profileId ?? "-" },
    { label: "Org ID", value: emp.orgId ?? "-" },
    { label: "Role", value: emp.role?.roleName ?? "-" },
    { label: "PAN", value: emp.panNo || "-" },
    { label: "Aadhar", value: emp.aadharNo || "-" },
    { label: "Passport", value: emp.passportNo || "-" },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Employee Details</h1>
        <p className="text-sm text-slate-600">{res.message}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t first:border-t-0">
                <td className="w-56 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  {r.label}
                </td>
                <td className="px-4 py-3 text-slate-900">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions table */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Permissions</h2>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold">Group</th>
              </tr>
            </thead>
            <tbody>
              {(emp.permissions ?? []).map((p: any, idx: number) => (
                <tr key={p.id ?? idx} className="border-t">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono">{p.code}</td>
                  <td className="px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3">{p.permissionGroup}</td>
                </tr>
              ))}

              {(!emp.permissions || emp.permissions.length === 0) && (
                <tr className="border-t">
                  <td className="px-4 py-3 text-slate-500" colSpan={4}>
                    No permissions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
