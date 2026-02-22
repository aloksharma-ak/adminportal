import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getStudentDetail } from "../../action";
import { getAdmissionMasterData } from "@/app/utils";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
import { Container } from "@/components/shared-ui/container";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

type Props = { params: Promise<{ id: string }> };

export default async function EditStudentPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  let student;
  let fetchError: string | null = null;
  let classOptions: { classId: number; className: string }[] = [];

  try {
    const [studentRes, masterRes] = await Promise.allSettled([
      getStudentDetail({ orgId: session.user.orgId, studentId }),
      getAdmissionMasterData({ orgId: session.user.orgId }),
    ]);

    // ---------------- Student ----------------
    if (studentRes.status === "fulfilled") {
      student = studentRes.value?.data;

      if (!student) {
        fetchError = "Student not found";
      }
    } else {
      fetchError =
        (studentRes.reason as Error)?.message ??
        "Failed to load student";
    }

    // ---------------- Master ----------------
    if (masterRes.status === "fulfilled") {
      const master = masterRes.value;

      classOptions = Array.isArray(master?.data.classMasters)
        ? master.data.classMasters.map((c) => ({
          classId: c.id,
          className: c.classText,
        }))
        : [];
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load data";
  }

  if (!fetchError && !student) notFound();

  return (
    <Container className="py-6">
      <PageHeader
        title="Edit Student"
        backHref={`/dashboard/admission/${studentId}`}
        backLabel="Back to Student"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {student && (
        <EnrollStudentForm
          orgId={session.user.orgId}
          orgName={session.user.orgName ?? ""}
          brandColor={session.user.brandColor ?? ""}
          classOptions={classOptions}
          studentId={studentId}
          defaultValues={student}
        />
      )}
    </Container>
  );
}
