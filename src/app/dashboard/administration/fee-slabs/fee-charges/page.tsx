import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getFeeChargesList, type FeeCharge, getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { LinkButton } from "@/components/controls/Buttons";
import { Plus } from "lucide-react";
import FeeChargesGrid from "@/components/administration/fee-slabs/FeeChargesGrid";
import { Container } from "@/components";

export default async function FeeChargesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let charges: FeeCharge[] = [];
  let fetchError: string | null = null;

  try {
    charges = await getFeeChargesList(
      session.user.orgId,
      session.user.profileId,
    );
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Failed to load fee charges";
  }

  let frequencyOptions: { id: number; value: string }[] = [];
  let gradeOptions: { id: number; value: string }[] = [];

  try {
    const master = await getAdmissionMasterData({
      orgId: session.user.orgId,
      userId: session.user.profileId,
    });

    frequencyOptions = (master.data.frequencyMasters ?? []).map((f) => ({
      id: f.id,
      value: f.name,
    }));

    gradeOptions = (master.data.gradeMasters ?? []).map((g) => ({
      id: g.id,
      value: g.grade,
    }));
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load data";
  }

  return (
    <Container className="py-6">
      <PageHeader
        title="Fee Charges"
        description="View and manage grade-wise fee charges"
        backLabel="Back to Fee Slabs"
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
        <FeeChargesGrid
          data={charges}
          brandColor={session.user.brandColor}
          frequencyOptions={frequencyOptions}
        />
      )}
    </Container>
  );
}
