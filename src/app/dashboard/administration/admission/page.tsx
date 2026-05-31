import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  getAdmissionMasterData,
  getStudentsByOrgId,
} from "@/app/dashboard/administration/actions";
import StudentsGrid from "@/components/administration/StudentsGrid";
import { ErrorCard } from "@/components/shared-ui/States";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { LinkButton } from "@/components/controls/Buttons";
import { UserPlus } from "lucide-react";

import { Container } from "@/components";

type AdmissionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParamValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdmissionPage({
  searchParams,
}: AdmissionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const resolvedSearchParams = (await searchParams) ?? {};
  const searchText = getSearchParamValue(resolvedSearchParams, "search") ?? "";
  const classIdValue = Number(
    getSearchParamValue(resolvedSearchParams, "classId") ?? 0,
  );
  const classId = Number.isFinite(classIdValue) ? classIdValue : 0;

  let students: Awaited<ReturnType<typeof getStudentsByOrgId>> = [];
  let classOptions: { label: string; value: string }[] = [];
  let fetchError: string | null = null;

  try {
    const [studentsRes, masterRes] = await Promise.all([
      getStudentsByOrgId(
        session.user.orgId,
        session.user.profileId,
        true,
        classId,
        searchText,
      ),
      getAdmissionMasterData({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
    ]);

    students = studentsRes;
    classOptions = (masterRes?.data?.classMasters ?? []).map((classMaster) => ({
      label: classMaster.classText,
      value: String(classMaster.id),
    }));
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Failed to load students";
  }

  const brandColor = session.user.brandColor ?? "#3b82f6";

  return (
    <Container className="py-6">
      <PageHeader
        title="Students"
        description="Manage student enrolments and records"
        backLabel="Back to Administration"
        actions={
          <LinkButton
            color={brandColor}
            href="/dashboard/administration/admission/enroll-student"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Enroll Student
          </LinkButton>
        }
      />
      {fetchError ? (
        <ErrorCard message={fetchError} />
      ) : (
        <StudentsGrid
          data={students}
          brandColor={brandColor}
          classOptions={classOptions}
          initialClassId={classId ? String(classId) : undefined}
          initialSearch={searchText}
        />
      )}
    </Container>
  );
}
