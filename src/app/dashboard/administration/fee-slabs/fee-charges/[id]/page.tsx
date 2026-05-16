import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getFeeChargeDetail } from "../../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import FeeChargeForm from "@/components/administration/fee-slabs/fee-charge-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditFeeChargePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const feeChargeId = Number(id);
  if (!Number.isInteger(feeChargeId) || feeChargeId <= 0) notFound();

  let charge;
  let fetchError: string | null = null;

  try {
    charge = await getFeeChargeDetail(feeChargeId, session.user.orgId, session.user.profileId);
    if (!charge) fetchError = "Charge not found";
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load fee charge";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Fee Charge"
        description="Update details for the fee charge"
        backLabel="Back to List"
        backHref="/dashboard/administration/fee-slabs/fee-charges"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {charge && (
        <FeeChargeForm
          orgId={session.user.orgId}
          brandColor={session.user.brandColor}
          feeChargeId={feeChargeId}
          defaultValues={charge}
        />
      )}
    </div>
  );
}
