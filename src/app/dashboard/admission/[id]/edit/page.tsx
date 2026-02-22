import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getStudentDetail } from "../../action";
import { getAdmissionMasterData } from "@/app/utils";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
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
  let categoryOptions: string[] = [];

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

      classOptions = master.data.classMasters.map((c) => ({
        classId: c.id,
        className: c.classText, // use classText like "1-A"
      }));

      categoryOptions = master.data.cateogryMaster ?? [];
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load data";
  }

  if (!fetchError && !student) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Edit Student"
        backLabel="Back to Student"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      {student && (
        <EnrollStudentForm
          orgId={session.user.orgId}
          orgName={session.user.orgName ?? ""}
          brandColor={session.user.brandColor ?? ""}
          classOptions={classOptions}
          categoryOptions={categoryOptions}
          studentId={studentId}
          defaultValues={student}
        />
      )}
    </div>
  );
}
