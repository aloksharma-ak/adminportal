import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getEmployeeList } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import EmployeeListGrid from "@/components/users/employee-list-grid";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

type EmployeeListItem = {
  empId: number;
  empName: string;
  initials?: string;
  profileId: number;
  userName: string | null;
  roleName: string;
  isActive: boolean;
};

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const res = await getEmployeeList({ orgId: session.user.orgId });

  if (!res?.status) {
    throw new Error(res?.message || "Failed to fetch employees");
  }

  const employees = Array.isArray(res?.data) ? res.data : [];

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

      <div className="mb-6 flex items-center justify-end">
        <LinkButton
          href="/dashboard/users/employees/create"
          color={session.user.brandColor}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Add Employee
        </LinkButton>
      </div>

      <EmployeeListGrid
        data={employees}
        brandColor={session.user.brandColor}
      />
    </div>
  );
}