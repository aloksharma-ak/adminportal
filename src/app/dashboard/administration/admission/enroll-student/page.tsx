import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import EnrollStudentForm from "@/components/administration/EnrollStudentForm";
import { getAdmissionMasterData } from "@/app/dashboard/administration/actions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";

import { Container } from "@/components";

export default async function EnrollStudentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let fetchError: string | null = null;
  let classOptions: { classId: number; className: string }[] = [];
  let categoryOptions: string[] = [];
  try {
    const master = await getAdmissionMasterData({ orgId: session.user.orgId, userId: session.user.profileId });

    classOptions = master.data.classMasters.map((c) => ({
      classId: c.id,
      className: c.classText,
    }));

    categoryOptions = master.data.cateogryMaster ?? [];
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load data";
  }

  return (
    <Container className="py-8">
      <PageHeader
        title="Enroll Student"
        description="Register a new student into the organisation"
        backLabel="Back to Admission"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      <EnrollStudentForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        classOptions={classOptions}
        categoryOptions={categoryOptions}
      />
    </Container>
  );
}
