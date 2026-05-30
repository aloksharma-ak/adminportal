import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import FeeChargeForm from "@/components/administration/fee-slabs/FeeChargeForm";

export default async function AddFeeChargePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

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
    // Keep empty arrays
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Add Fee Charge"
        description="Define a new grade-wise fee charge"
        backLabel="Back to List"
      />
      <FeeChargeForm
        orgId={session.user.orgId}
        brandColor={session.user.brandColor}
        frequencyOptions={frequencyOptions}
        gradeOptions={gradeOptions}
      />
    </div>
  );
}
