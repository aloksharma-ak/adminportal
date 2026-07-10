import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  getAdmissionMasterData,
  getStudentsByOrgId,
} from "@/app/dashboard/administration/actions";
import StudentsGrid from "@/components/administration/StudentsGrid";
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

  const [studentsResult, masterResult] = await Promise.allSettled([
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

  if (studentsResult.status === "fulfilled") {
    students = studentsResult.value;
  } else {
    const fullError =
      studentsResult.reason instanceof Error
        ? studentsResult.reason.message
        : "Failed to load students";
    const colonIndex = fullError.indexOf(":");
    fetchError = colonIndex !== -1 ? fullError.substring(colonIndex + 1).trim() : fullError;
  }

  if (masterResult.status === "fulfilled") {
    const masterRes = masterResult.value;
    classOptions = (masterRes?.data?.classMasters ?? []).map((classMaster) => ({
      label: classMaster.classText,
      value: String(classMaster.id),
    }));
  } else {
    console.error("Failed to load admission master data:", masterResult.reason);
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
      <StudentsGrid
        data={students}
        brandColor={brandColor}
        classOptions={classOptions}
        initialClassId={classId ? String(classId) : undefined}
        initialSearch={searchText}
        errorMessage={fetchError}
      />
    </Container>
  );
}
