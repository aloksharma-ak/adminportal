import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee, getMasterData, type Role } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditEmployeeForm from "@/components/users/edit-employee-form";

interface Props {
  params: { id: string };
}

export default async function EditEmployeePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

   const { id } = await params;

  const empId = Number(id);
  if (!Number.isFinite(empId) || empId <= 0) notFound();

  // Fetch roles and employee detail in parallel
  let roles: Role[] = [];
  let employee;

  try {
    const [masterData, empDetail] = await Promise.all([
      getMasterData({ orgId: session.user.orgId }),
      getEmployee({ profileId: empId, orgId: session.user.orgId }),
    ]);

    roles = (masterData?.data?.roleMaster ?? [])
      .filter((r) => r.isActive)
      .map((r) => ({
        roleId: r.id,
        roleName: r.roleName,
      }));

    employee = empDetail?.data;
  } catch {
    roles = [];
  }

  if (!employee) notFound();

  console.log('-------------->', roles)
  console.log('-------------->', employee)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard/users/employees"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
      </div>

      <EditEmployeeForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        roles={roles}
        employee={employee}
      />
    </div>
  );
}