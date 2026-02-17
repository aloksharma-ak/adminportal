import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getRolePermissions } from "@/app/utils";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard/roles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roles
        </Link>
      </div>

      {fetchError ? (
        <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
      ) : (
        <RolePermissionsEditor
          roleData={roleData!}
          brandColor={session.user.brandColor}
        />
      )}
    </div>
  );
}
