import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getAdmissionChargeDetail } from "../../../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import AdmissionChargeForm from "@/components/administration/fee-slabs/admission-charge-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditAdmissionChargePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const chargeId = Number(id);
  if (!Number.isInteger(chargeId) || chargeId <= 0) notFound();

  let charge;
  let fetchError: string | null = null;

  try {
    charge = await getAdmissionChargeDetail(
      chargeId,
      session.user.orgId,
      session.user.profileId,
    );
    if (!charge) fetchError = "Charge not found";
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load admission charge";
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
        />
      )}
    </div>
  );
}
