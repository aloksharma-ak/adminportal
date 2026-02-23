import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getMasterData } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import CreatePermissionForm from "@/components/users/roles/create-permission-form";

type ModuleItem = {
  moduleId: number;
  moduleName: string;
  icon?: string | null;
};

export default async function CreatePermissionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let modules: ModuleItem[] = [];
  let masterError: string | null = null;

  try {
    const masterData = await getMasterData({ orgId: session.user.orgId });

    modules = (masterData?.data?.modules ?? [])
      .filter(
        (m) =>
          Number.isFinite(Number(m.moduleId)) &&
          Number(m.moduleId) > 0 &&
          String(m.moduleName ?? "").trim().length > 0,
      )
      .map((m) => ({
        moduleId: Number(m.moduleId),
        moduleName: String(m.moduleName),
        icon: m.icon ?? null,
      }));
  } catch (err) {
    masterError = err instanceof Error ? err.message : "Could not load modules";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Permission"
        description="Select a permission, assign it to a module, and save"
        backLabel="Back to Roles"
      />

      {masterError && (
        <div className="mb-6">
          <ErrorCard
            message={`Modules unavailable: ${masterError}. Module selection may be limited.`}
          />
        </div>
      )}

   
      <CreatePermissionForm
        modules={modules}
        brandColor={session.user.brandColor ?? ""}
        successRedirect="/dashboard/users/roles"
      />
    </div>
  );
}