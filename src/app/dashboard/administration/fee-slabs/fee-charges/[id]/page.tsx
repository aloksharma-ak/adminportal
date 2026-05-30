import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getFeeChargeDetail, getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { FeeChargeDetails } from "@/components/administration/fee-slabs/DetailsView";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Container } from "@/components";

type Props = { params: Promise<{ id: string }> };

export default async function ViewFeeChargePage({ params }: Props) {
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
      getFeeChargeDetail(
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
    if (!charge) {
      fetchError = "Charge not found";
    } else {
      frequencyOptions = (masterRes.data.frequencyMasters ?? []).map((f) => ({
        id: f.id,
        value: f.name,
      }));
    }
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load fee charge";
  }

  const brandColor = session.user.brandColor ?? undefined;

  return (
    <Container className="py-8">
      <PageHeader
        title={charge ? `Fee for ${charge.fee.grade}` : "Fee Charge Details"}
        description="View configuration for this grade-wise fee"
        backLabel="Back to List"
        actions={
          charge && (
            <Link
              href={`/dashboard/administration/fee-slabs/fee-charges/${chargeId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: brandColor ?? "#3b82f6" }}
            >
              <Pencil className="h-4 w-4" />
              Edit Fee
            </Link>
          )
        }
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {charge && (
        <FeeChargeDetails
          charge={charge.fee}
          brandColor={brandColor}
          frequencyOptions={frequencyOptions}
        />
      )}
    </Container>
  );
}
