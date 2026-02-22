import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
import { getAdmissionMasterData } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared-ui/page-header";
import { ErrorCard } from "@/components/shared-ui/states";

export default async function EnrollStudentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let fetchError: string | null = null;
  let classOptions: { classId: number; className: string }[] = [];
  let categoryOptions: string[] = [];
  try {

    const master = await getAdmissionMasterData({ orgId: session.user.orgId });

    classOptions = master.data.classMasters.map((c) => ({
      classId: c.id,
      className: c.classText, // use classText like "1-A"
    }));

    categoryOptions = master.data.cateogryMaster ?? [];
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load data";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Enroll Student"
        description="Register a new student into the organisation"
        backLabel="Back to Admissions"
      />
      {fetchError && <ErrorCard message={fetchError} />}
      <EnrollStudentForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        classOptions={classOptions}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
