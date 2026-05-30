import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getStudentsByOrgId } from "@/app/dashboard/administration/actions";
import StudentsGrid from "@/components/administration/StudentsGrid";
import { ErrorCard } from "@/components/shared-ui/States";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus } from "lucide-react";

import { Container } from "@/components";

export default async function AdmissionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let students: Awaited<ReturnType<typeof getStudentsByOrgId>> = [];
  let fetchError: string | null = null;

  try {
    students = await getStudentsByOrgId(
      session.user.orgId,
      session.user.profileId,
    );
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load students";
  }

  const brandColor = session.user.brandColor ?? "#3b82f6";

  return (
    <Container className="py-6">
      <PageHeader
        title="Admission"
        description="Manage student enrolments and records"
        backLabel="Back to Administration"
        actions={
          <LinkButton
            color={brandColor}
            href="/dashboard/administration/admission/enroll-student"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Enroll Student
          </LinkButton>
        }
      />
      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <StudentsGrid data={students} brandColor={brandColor} />
      )}
    </Container>
  );
}
