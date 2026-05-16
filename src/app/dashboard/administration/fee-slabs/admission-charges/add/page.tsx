import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import AdmissionChargeForm from "@/components/administration/fee-slabs/admission-charge-form";

export default async function AddAdmissionChargePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Admission Charge"
        description="Define a new admission related charge"
        backLabel="Back to List"
        backHref="/dashboard/administration/fee-slabs/admission-charges"
      />
      <AdmissionChargeForm
        orgId={session.user.orgId}
        brandColor={session.user.brandColor}
      />
    </div>
  );
}
