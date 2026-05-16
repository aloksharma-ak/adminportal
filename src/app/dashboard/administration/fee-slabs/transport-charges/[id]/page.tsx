import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getTransportChargeDetail } from "../../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import TransportChargeForm from "@/components/administration/fee-slabs/transport-charge-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditTransportChargePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const transportChargeId = Number(id);
  if (!Number.isInteger(transportChargeId) || transportChargeId <= 0) notFound();

  let charge;
  let fetchError: string | null = null;

  try {
    charge = await getTransportChargeDetail(transportChargeId, session.user.orgId, session.user.profileId);
    if (!charge) fetchError = "Charge not found";
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load transport charge";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Transport Charge"
        description="Update details for the transport charge"
        backLabel="Back to List"
        backHref="/dashboard/administration/fee-slabs/transport-charges"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {charge && (
        <TransportChargeForm
          orgId={session.user.orgId}
          brandColor={session.user.brandColor}
          id={transportChargeId}
          defaultValues={charge}
        />
      )}
    </div>
  );
}
