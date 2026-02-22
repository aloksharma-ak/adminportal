import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRolePermissions } from "@/app/utils";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import RolePermissionsEditor from "@/components/roles/role-permissions-editor";

type PageProps = { params: Promise<{ id: string }> };

export default async function RoleDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) notFound();

  let roleData: Awaited<ReturnType<typeof getRolePermissions>>["data"] | null = null;
  let fetchError: string | null = null;

  try {
    const res = await getRolePermissions({ roleId });
    roleData = res?.data ?? null;
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load role";
  }

  if (!fetchError && !roleData) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <PageHeader
        title={roleData?.roleName ?? "Role Permissions"}
        description="Manage which permissions are enabled for this role"
        backLabel="Back to Roles"
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <RolePermissionsEditor
          roleData={roleData!}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}
