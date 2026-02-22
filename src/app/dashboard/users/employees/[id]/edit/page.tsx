import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployee, getMasterData, type Role } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import EditEmployeeForm from "@/components/users/edit-employee-form";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

type Props = { params: Promise<{ id: string }> };

export default async function EditEmployeePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const empId = Number(id);
  if (!Number.isFinite(empId) || empId <= 0) notFound();

  let roles: Role[] = [];
  let employee;
  let fetchError: string | null = null;

  const [masterResult, empResult] = await Promise.allSettled([
    getMasterData({ orgId: session.user.orgId }),
    getEmployee({ profileId: 0, empId, orgId: session.user.orgId }),
  ]);

  if (masterResult.status === "fulfilled") {
    roles = (masterResult.value?.data?.roleMaster ?? [])
      .filter((r) => r.isActive)
      .map((r) => ({ roleId: r.id, roleName: r.roleName }));
  }

  if (empResult.status === "fulfilled") {
    employee = empResult.value?.data;
    if (!employee) fetchError = empResult.value?.message ?? "Employee not found";
  } else {
    fetchError = (empResult.reason as Error)?.message ?? "Failed to load employee";
  }

  if (!fetchError && !employee) notFound();

  const fullName = employee
    ? [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(" ")
    : "Employee";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader
        title={`Edit: ${fullName}`}
        description="Update employee information"
        backHref={`/dashboard/users/employees/${empId}`}
        backLabel="Back to Employee"
      />

      {fetchError && <ErrorCard message={fetchError} />}

      {employee && (
        <EditEmployeeForm
          orgId={session.user.orgId}
          orgName={session.user.orgName ?? ""}
          brandColor={session.user.brandColor ?? ""}
          roles={roles}
          employee={employee}
        />
      )}
    </div>
  );
}
