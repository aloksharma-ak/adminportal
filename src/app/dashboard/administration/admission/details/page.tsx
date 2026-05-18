import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getStudentsByOrgId } from "@/app/dashboard/administration/actions";
import StudentsGrid from "@/components/administration/StudentsGrid";
import { ErrorCard } from "@/components/shared-ui/States";

export default async function AdmissionDetailsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let students: Awaited<ReturnType<typeof getStudentsByOrgId>> = [];
  let fetchError: string | null = null;

  try {
    students = await getStudentsByOrgId(session.user.orgId, session.user.profileId);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load students";
  }

  return (
    <div className="w-full">
      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <StudentsGrid data={students} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
