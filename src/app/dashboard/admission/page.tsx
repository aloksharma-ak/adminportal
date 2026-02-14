import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getStudentsByOrgId } from "./action";
import StudentsGrid from "@/components/admission/students-grid";

export default async function IndexAdmission() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const students = await getStudentsByOrgId(session.user.orgId);

  return (
    <div className="p-6">
      <div>hhh</div>
      <StudentsGrid data={students} brandColor={session.user.brandColor} />
    </div>
  );
}
