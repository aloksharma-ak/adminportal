import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import TransportChargeForm from "@/components/administration/fee-slabs/TransportChargeForm";
import { Container } from "@/components";

export default async function AddTransportChargePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let frequencyOptions: { id: number; value: string }[] = [];

  try {
    const master = await getAdmissionMasterData({
      orgId: session.user.orgId,
      userId: session.user.profileId,
    });

    frequencyOptions = (master.data.frequencyMasters ?? []).map((f) => ({
      id: f.id,
      value: f.name,
    }));
  } catch (err) {
    // Fail silently or handle accordingly
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Add Transport Charge"
        description="Define a new distance-based transport charge"
        backLabel="Back to List"
      />
      <TransportChargeForm
        orgId={session.user.orgId}
        brandColor={session.user.brandColor}
        frequencyOptions={frequencyOptions}
      />
    </Container>
  );
}
