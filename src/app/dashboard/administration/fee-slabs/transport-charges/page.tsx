import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getTransportChargesList, type TransportCharge } from "../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import { LinkButton } from "@/components/controls/Buttons";
import { Plus } from "lucide-react";
import TransportChargesGrid from "@/components/administration/fee-slabs/transport-charges-grid";

export default async function TransportChargesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let charges: TransportCharge[] = [];
  let fetchError: string | null = null;

  try {
    charges = await getTransportChargesList(session.user.orgId, session.user.profileId);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load transport charges";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Transport Charges"
        description="View and manage distance-based transport charges"
        backLabel="Back to Fee Slabs"
        backHref="/dashboard/administration/fee-slabs"
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
        <TransportChargesGrid data={charges} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
