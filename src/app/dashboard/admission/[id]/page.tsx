import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import StudentDetails from "@/components/admission/student-details";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getStudentDetail } from "../action";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  let student;
  try {
    const res = await getStudentDetail({
      orgId: session.user.orgId,
      studentId,
    });
    student = res?.data;
  } catch {
    notFound();
  }

  if (!student) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard/admission"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admissions
        </Link>
      </div>

      <StudentDetails student={student} />
    </div>
  );
}
