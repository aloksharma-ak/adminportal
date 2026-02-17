import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import EnrollStudentForm from "@/components/admission/enroll-student-form";
import { Container } from "@/components/shared-ui/container";
import { getAdmissionMasterData } from "@/app/utils";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EnrollStudentPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // Fetch class list from Admission Master Data
  // let classOptions: { classId: number; className: string }[] = [];
  // try {
  //   const master = await getAdmissionMasterData({ orgId: session.user.orgId });
  //   classOptions = Array.isArray(master?.data?.classes) ? master.data.classes : [];
  // } catch {
  //   // Form will show a warning if empty
  // }

  return (
    <Container className="py-6">
      <div className="mb-6">
        <Link
          href="/dashboard/admission"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admissions
        </Link>
      </div>

      <EnrollStudentForm
        orgId={session.user.orgId}
        orgName={session.user.orgName ?? ""}
        brandColor={session.user.brandColor ?? ""}
        // classOptions={classOptions}
      />
    </Container>
  );
}
