import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTransportChargesList, type TransportCharge, getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { LinkButton } from "@/components/controls/Buttons";
import { Plus } from "lucide-react";
import TransportChargesGrid from "@/components/administration/fee-slabs/TransportChargesGrid";
import { Container } from "@/components";

export default async function TransportChargesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let charges: TransportCharge[] = [];
  let frequencyOptions: { id: number; value: string }[] = [];
  let fetchError: string | null = null;

  try {
    const [chargesRes, masterRes] = await Promise.all([
      getTransportChargesList(session.user.orgId, session.user.profileId),
      getAdmissionMasterData({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
    ]);

    charges = chargesRes;
    frequencyOptions = (masterRes?.data?.frequencyMasters ?? []).map((f) => ({
      id: f.id,
      value: f.name,
    }));
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load transport charges data";
  }

  return (
    <Container className="py-6">
      <PageHeader
        title="Transport Charges"
        description="View and manage distance-based transport charges"
        backLabel="Back to Fee Slabs"
        actions={
          <LinkButton
            color={session.user.brandColor}
            href="/dashboard/administration/fee-slabs/transport-charges/add"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Transport Charge
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <TransportChargesGrid
          data={charges}
          brandColor={session.user.brandColor}
          frequencyOptions={frequencyOptions}
        />
      )}
    </Container>
  );
}
