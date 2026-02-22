import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getStudentsByOrgId } from "./action";
import StudentsGrid from "@/components/admission/students-grid";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

export default async function AdmissionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let students: Awaited<ReturnType<typeof getStudentsByOrgId>> = [];
  let fetchError: string | null = null;

  try {
    students = await getStudentsByOrgId(session.user.orgId);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load students";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <PageHeader
        title="Admissions"
        description="Manage student enrolments and records"
        backLabel="Back to Dashboard"
        actions={
          <LinkButton
            color={session.user.brandColor}
            href="/dashboard/admission/enroll-student"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Enroll Student
          </LinkButton>
        }
      />

      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <StudentsGrid data={students} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
