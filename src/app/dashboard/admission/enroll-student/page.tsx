import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
import { getAdmissionMasterData } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import { Container } from "@/components/shared-ui/container";

export default async function EnrollStudentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let classOptions: { classId: number; className: string }[] = [];
  let categoryOptions: string[] = [];
  try {

    const master = await getAdmissionMasterData({ orgId: session.user.orgId });

    classOptions = master.data.classMasters.map((c) => ({
      classId: c.id,
      className: c.classText, // use classText like "1-A"
    }));

    categoryOptions = master.data.cateogryMaster ?? [];
  } catch {
    // Fallback: form shows class ID text input
  }

  return (
    <Container className="py-6">
      <PageHeader
        title="Enroll Student"
        description="Register a new student into the organisation"
        backHref="/dashboard/admission"
        backLabel="Back to Admissions"
      />
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
