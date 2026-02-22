import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRolePermissions, RolePermissionDetail } from "@/app/utils";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import RolePermissionsEditor from "@/components/users/roles/role-permissions-editor";

type PageProps = { params: { id: string } };

export default async function RoleDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const {id} = await params;

  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) notFound();

  let permissions: RolePermissionDetail[] = [];
  let fetchError: string | null = null;

  try {
    const res = await getRolePermissions({ roleId });
    if (res?.status && Array.isArray(res.data)) {
      permissions = res.data;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load role permissions";
  }

  if (!fetchError && permissions.length === 0) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Role Permissions"
        description="Manage which permissions are enabled for this role"
        backLabel="Back to Roles"
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <RolePermissionsEditor
          roleId={roleId}
          permissions={permissions}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}