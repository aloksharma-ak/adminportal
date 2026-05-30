import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import TransportChargeForm from "@/components/administration/fee-slabs/TransportChargeForm";
import { getTransportChargeDetail, getAdmissionMasterData } from "@/app/dashboard/administration/actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditTransportChargePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const chargeId = Number(id);
  if (!Number.isInteger(chargeId) || chargeId <= 0) notFound();

  let charge;
  let frequencyOptions: { id: number; value: string }[] = [];
  let fetchError: string | null = null;

  try {
    const [chargeRes, masterRes] = await Promise.all([
      getTransportChargeDetail(
        chargeId,
        session.user.orgId,
        session.user.profileId,
      ),
      getAdmissionMasterData({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
    ]);

    charge = chargeRes;
    if (!charge) fetchError = "Charge not found";

    frequencyOptions = (masterRes?.data?.frequencyMasters ?? []).map((f) => ({
      id: f.id,
      value: f.name,
    }));
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load transport charge data";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Transport Charge"
        description="Update details for the transport charge"
        backLabel="Back to View"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {charge && (
        <TransportChargeForm
          orgId={session.user.orgId}
          brandColor={session.user.brandColor}
          id={chargeId}
          defaultValues={charge}
          frequencyOptions={frequencyOptions}
        />
      )}
    </div>
  );
}
