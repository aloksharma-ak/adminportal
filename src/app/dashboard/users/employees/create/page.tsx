import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getMasterData, getRoles, type Role } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CreateEmployeeForm from "@/components/users/create-employee-form";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

export default async function CreateEmployeePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let roles: Role[] = [];
  let masterError: string | null = null;

  try {
    const [masterRes, rolesRes] = await Promise.allSettled([
      getMasterData({ orgId: session.user.orgId, userId: session.user.profileId }),
      getRoles({ userId: session.user.profileId }),
    ]);

    let rawRoles: any[] = [];

    if (masterRes.status === "fulfilled" && masterRes.value?.data?.roleMaster) {
      rawRoles = masterRes.value.data.roleMaster;
    }

    // Fallback to getRoles if masterData is empty
    if (rawRoles.length === 0 && rolesRes.status === "fulfilled" && rolesRes.value?.data?.roles) {
      rawRoles = rolesRes.value.data.roles;
    }

    roles = rawRoles
      .filter((r) => r.isActive !== false)
      .map((r) => ({
        roleId: r.roleId || r.id,
        roleName: r.roleName
      }));

  } catch (err) {
    masterError = err instanceof Error ? err.message : "Could not load roles";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Employee"
        description="Create a new staff member account"
        backLabel="Back to Employees"
      />

      {masterError && (
        <div className="mb-4">
          <ErrorCard message={`Roles unavailable: ${masterError}. You can still create the employee.`} />
        </div>
      )}

      <CreateEmployeeForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        roles={roles}
      />
    </div>
  );
}
