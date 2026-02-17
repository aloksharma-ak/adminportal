import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getMasterData } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreateEmployeeForm from "@/components/users/create-employee-form";

export default async function CreateEmployeePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // Load roles from master data so form is always up-to-date
  let roles: { roleId: number; roleName: string }[] = [];
  try {
    const masterData = await getMasterData({ orgId: session.user.orgId });
    roles = Array.isArray(masterData?.data?.roles) ? masterData.data.roles : [];
  } catch {
    // Fall back to empty — form will show a "no roles" message
  }

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

      <CreateEmployeeForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        roles={roles}
      />
    </div>
  );
}
