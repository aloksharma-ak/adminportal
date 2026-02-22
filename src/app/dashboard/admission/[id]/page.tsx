import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getStudentDetail } from "../action";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";
import StudentDetails from "@/components/admission/student-details";

type PageProps = { params: Promise<{ id: string }> };

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  let student;
  let fetchError: string | null = null;

  try {
    const res = await getStudentDetail({ orgId: session.user.orgId, studentId });
    student = res?.data;
    if (!student) fetchError = "Student not found";
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load student";
  }

  if (!fetchError && !student) notFound();

  const brandColor = session.user.brandColor ?? undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={student ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student Details" : "Student Details"}
        backLabel="Back to Admissions"
        actions={
          student && (
            <Link
              href={`/dashboard/admission/${studentId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: brandColor ?? "#3b82f6" }}
            >
              <Pencil className="h-4 w-4" />
              Edit Student
            </Link>
          )
        }
      />

      {fetchError && <ErrorCard message={fetchError} />}
      {student && <StudentDetails student={student} brandColor={brandColor} />}
    </div>
  );
}
