import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getFeeChargesList, type FeeCharge } from "../action";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import { LinkButton } from "@/components/controls/Buttons";
import { Plus } from "lucide-react";
import FeeChargesGrid from "@/components/administration/fee-slabs/fee-charges-grid";

export default async function FeeChargesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let charges: FeeCharge[] = [];
  let fetchError: string | null = null;

  try {
    charges = await getFeeChargesList(session.user.orgId, session.user.profileId);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load fee charges";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Fee Charges"
        description="View and manage grade-wise fee charges"
        backLabel="Back to Fee Slabs"
        backHref="/dashboard/administration/fee-slabs"
        actions={
          <LinkButton
            color={session.user.brandColor}
            href="/dashboard/administration/fee-slabs/fee-charges/add"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Fee Charge
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <FeeChargesGrid data={charges} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
