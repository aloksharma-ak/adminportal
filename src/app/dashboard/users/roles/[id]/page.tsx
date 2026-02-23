import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getRolePermissions,
  getMasterData, // ✅ added
  RolePermissionDetail,
} from "@/app/utils";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import RolePermissionsEditor from "@/components/users/roles/role-permissions-editor";

type PageProps = { params: Promise<{ id: string }> };

/** Deduplicate permissions by id — the API sometimes returns duplicates (e.g. id=7 twice) */
function dedupeById(perms: RolePermissionDetail[]): RolePermissionDetail[] {
  const seen = new Set<number>();
  return perms.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export default async function RoleDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const roleId = Number(id);
  if (!Number.isInteger(roleId) || roleId <= 0) notFound();

  let assignedPermissions: RolePermissionDetail[] = [];
  let modules: { moduleId: number; moduleName: string; icon?: string | null }[] =
    [];
  let fetchError: string | null = null;

  try {
    // ✅ adjust this path if your session stores org id under a different key
    const orgId = Number(session.user.orgId);

    if (!Number.isFinite(orgId) || orgId <= 0) {
      throw new Error("Invalid organisation ID");
    }

    // ✅ fetch both in parallel
    const [rolePermsRes, masterDataRes] = await Promise.all([
      getRolePermissions({ roleId }),
      getMasterData({ orgId }),
    ]);

    if (rolePermsRes?.status && Array.isArray(rolePermsRes.data)) {
      assignedPermissions = dedupeById(rolePermsRes.data);
    } else {
      fetchError = rolePermsRes?.message ?? "Failed to load role permissions";
    }

    if (!fetchError) {
      if (masterDataRes?.status && masterDataRes.data) {
        modules = masterDataRes.data.modules ?? [];
      } else {
        fetchError = masterDataRes?.message ?? "Failed to load master data";
      }
    }
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load role permissions";
  }

  // 404 only when there's no API error but nothing came back at all
  if (!fetchError && assignedPermissions.length === 0) notFound();

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
          assignedPermissions={assignedPermissions}
          modules={modules}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}