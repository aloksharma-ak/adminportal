import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRoles, Role } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RoleListGrid from "@/components/users/roles/role-list-grid";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import { LinkButton } from "@/components/controls/Buttons";
import { ShieldPlus } from "lucide-react";

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let roles: Role[] = [];
  let fetchError: string | null = null;

  try {
    const res = await getRoles();

    if (res?.status && Array.isArray(res?.data?.roles)) {
      roles = res.data.roles;
    }
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load roles";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Roles & Permissions"
        description="View and manage organisation roles"
        backLabel="Back to Users"
        actions={
          <LinkButton
            href="/dashboard/users/roles/create"
            color={session.user.brandColor}
            leftIcon={<ShieldPlus className="h-4 w-4" />}
          >
            Create Role Premission
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <RoleListGrid
          data={roles}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}