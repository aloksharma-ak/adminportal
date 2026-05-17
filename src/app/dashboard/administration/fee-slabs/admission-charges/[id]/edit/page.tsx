import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getAdmissionChargeDetail, getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import AdmissionChargeForm from "@/components/administration/fee-slabs/AdmissionChargeForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdmissionChargePage({ params }: Props) {
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
      getAdmissionChargeDetail(
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
      err instanceof Error ? err.message : "Failed to load admission charge data";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Admission Charge"
        description="Update details for the admission charge"
        backLabel="Back to View"
        backHref={`/dashboard/administration/fee-slabs/admission-charges/${chargeId}`}
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {charge && (
        <AdmissionChargeForm
          orgId={session.user.orgId}
          brandColor={session.user.brandColor}
          chargeId={chargeId}
          defaultValues={charge}
          frequencyOptions={frequencyOptions}
        />
      )}
    </div>
  );
}
