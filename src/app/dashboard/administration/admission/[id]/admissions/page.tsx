import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  getStudentDetail,
  getStudentAdmissionsList,
  StudentAdmission,
} from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard, EmptyState } from "@/components/shared-ui/States";
import AdmissionsGrid from "@/components/administration/AdmissionsGrid/AdmissionsGrid";
import { Container } from "@/components";

type Props = { params: Promise<{ id: string }> };

export default async function StudentAdmissionsPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  let student;
  let admissions: StudentAdmission[] = [];
  let errorMsg: string | null = null;
  let emptyStateMessage =
    "This student does not have any recorded admissions yet.";

  try {
    const studentRes = await getStudentDetail({
      orgId: session.user.orgId,
      studentId,
      userId: session.user.profileId,
    });
    student = studentRes?.data;

    if (student) {
      try {
        const listRes = await getStudentAdmissionsList({
          orgId: session.user.orgId,
          studentId,
          userId: session.user.profileId,
        });
        admissions = listRes?.data?.admissions ?? [];
      } catch (listErr) {
        const msg = listErr instanceof Error ? listErr.message : "";
        if (msg.includes("Admision not found for Srudent")) {
          admissions = [];
          emptyStateMessage = "Admision not found for Srudent";
        } else {
          throw listErr;
        }
      }
    } else {
      errorMsg = "Student not found";
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load data";
  }

  if (errorMsg) {
    return (
      <Container className="py-8">
        <PageHeader title="Student Admissions" backLabel="Back to Admission" />
        <div className="mt-6">
          <ErrorCard message={errorMsg} />
        </div>
      </Container>
    );
  }

  if (!student) notFound();

  const brandColor = session.user.brandColor ?? undefined;
  const studentName =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";

  return (
    <Container className="py-8">
      <PageHeader
        title={`${studentName} - Admission Records`}
        description="View past and current academic enrollment records"
        backLabel="Back to Student Details"
      />

      <div className="mt-8">
        {admissions.length === 0 ? (
          <EmptyState
            title="No Admissions Found"
            description={emptyStateMessage}
          />
        ) : (
          <AdmissionsGrid
            admissions={admissions}
            studentId={studentId}
            brandColor={brandColor}
          />
        )}
      </div>
    </Container>
  );
}
