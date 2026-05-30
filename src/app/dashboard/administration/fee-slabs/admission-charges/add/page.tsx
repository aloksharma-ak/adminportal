import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import AdmissionChargeForm from "@/components/administration/fee-slabs/AdmissionChargeForm";

export default async function AddAdmissionChargePage() {
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Admission Charge"
        description="Define a new admission related charge"
        backLabel="Back to List"
      />
      <AdmissionChargeForm
        orgId={session.user.orgId}
        brandColor={session.user.brandColor}
        frequencyOptions={frequencyOptions}
      />
    </div>
  );
}
