import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Container } from "@/components";
import { getAdmissionMasterData, type ClassMaster } from "@/app/dashboard/administration/actions";
import AdministrationDashboard from "./AdministrationDashboard";

export default async function AdministrationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let classMasters: ClassMaster[] = [];
  try {
    const masterData = await getAdmissionMasterData({
      orgId: session.user.orgId,
      userId: session.user.profileId,
    });
    classMasters = masterData?.data?.classMasters ?? [];
  } catch (err) {
    console.error("Failed to load admission master data:", err);
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Administration"
        description="Manage school operations and financial configurations"
        backLabel="Back to Dashboard"
      />

      <AdministrationDashboard
        orgId={session.user.orgId}
        userId={session.user.profileId}
        classMasters={classMasters}
        brandColor={session.user.brandColor}
      />
    </Container>
  );
}
