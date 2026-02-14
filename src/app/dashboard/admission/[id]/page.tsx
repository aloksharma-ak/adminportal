import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import StudentDetails from "@/components/admission/student-details";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { getStudentDetail } from "../action";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);

  if (!Number.isFinite(studentId)) notFound();

  const res = await getStudentDetail({
    orgId: session.user.orgId,
    studentId,
  });

  const student = res?.data;
  if (!student) notFound();

  return (
    <div className="p-6">
      <StudentDetails student={student} />
    </div>
  );
}
