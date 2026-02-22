import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployeeList } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EmployeeListGrid from "@/components/users/employee-list-grid";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let employees: Awaited<ReturnType<typeof getEmployeeList>>["data"] = [];
  let fetchError: string | null = null;

  try {
    const res = await getEmployeeList({ orgId: session.user.orgId });
    employees = Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load employees";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Employees"
        description="View, edit and manage all staff members"
        backLabel="Back to Users"
        actions={
          <LinkButton
            href="/dashboard/users/employees/create"
            color={session.user.brandColor}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Add Employee
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <EmployeeListGrid data={employees} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
