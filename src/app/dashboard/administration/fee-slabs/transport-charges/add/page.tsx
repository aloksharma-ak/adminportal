import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import TransportChargeForm from "@/components/administration/fee-slabs/transport-charge-form";

export default async function AddTransportChargePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Transport Charge"
        description="Define a new distance-based transport charge"
        backLabel="Back to List"
        backHref="/dashboard/administration/fee-slabs/transport-charges"
      />
      <TransportChargeForm
        orgId={session.user.orgId}
        brandColor={session.user.brandColor}
      />
    </div>
  );
}
