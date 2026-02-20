import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getStudentsByOrgId } from "./action";
import StudentsGrid from "@/components/admission/students-grid";
import { LinkButton } from "@/components/controls/Buttons";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function AdmissionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  let students: Awaited<ReturnType<typeof getStudentsByOrgId>> = [];
  let fetchError: string | null = null;

  try {
    students = await getStudentsByOrgId(session.user.orgId);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load students";
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Admissions
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Manage student enrolments
          </p>
        </div>

        <LinkButton
          color={session.user.brandColor}
          href="/dashboard/admission/enroll-student"
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Enroll Student
        </LinkButton>
      </div>

      {fetchError ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              {fetchError}
            </p>
          </CardContent>
        </Card>
      ) : (
        <StudentsGrid data={students} brandColor={session.user.brandColor} />
      )}
    </div>
  );
}
