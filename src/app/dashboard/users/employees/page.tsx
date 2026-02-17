import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployeeList } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EmployeeListGrid from "@/components/users/employee-list-grid";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let employees: Awaited<ReturnType<typeof getEmployeeList>>["data"] = [];
  let fetchError: string | null = null;

  try {
    const res = await getEmployeeList({ orgId: session.user.orgId });
    employees = Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load employees";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Employees
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            All staff members in your organisation
          </p>
        </div>
        <LinkButton
          href="/dashboard/users/employees/create"
          color={session.user.brandColor}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add Employee
        </LinkButton>
      </div>

      {fetchError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              {fetchError}
            </p>
          </CardContent>
        </Card>
      ) : (
        <EmployeeListGrid
          data={employees}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}
