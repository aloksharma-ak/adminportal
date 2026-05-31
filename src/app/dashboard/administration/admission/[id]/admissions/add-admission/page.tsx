import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  AdmissionStatusMaster,
  ClassMaster,
  FrequencyMaster,
  getAdmissionMasterData,
  getStudentDetail,
} from "@/app/dashboard/administration/actions";
import ModifyAdmissionForm from "@/components/administration/ModifyAdmissionForm/ModifyAdmissionForm";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";

import { Container } from "@/components";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AddAdmissionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const studentId = Number(id);
  if (!Number.isInteger(studentId) || studentId <= 0) notFound();

  let student;
  let classMasters: ClassMaster[] = [];
  let admissionStatusMasters: AdmissionStatusMaster[] = [];
  let frequencyMasters: FrequencyMaster[] = [];
  let errorMsg: string | null = null;

  try {
    const [studentRes, masterRes] = await Promise.all([
      getStudentDetail({
        orgId: session.user.orgId,
        studentId,
        userId: session.user.profileId,
      }),
      getAdmissionMasterData({
        orgId: session.user.orgId,
        userId: session.user.profileId,
      }),
    ]);

    student = studentRes?.data;
    classMasters = masterRes?.data?.classMasters ?? [];
    admissionStatusMasters = masterRes?.data?.admissionStatusMasters ?? [];
    frequencyMasters = masterRes?.data?.frequencyMasters ?? [];

    if (!student) {
      errorMsg = "Student not found";
    }
  } catch (err) {
    errorMsg =
      err instanceof Error ? err.message : "Failed to load admission data";
  }

  if (errorMsg) {
    return (
      <Container className="max-w-4xl py-8">
        <PageHeader title="Add Admission" backLabel="Back to Admissions" />
        <div className="mt-6">
          <ErrorCard message={errorMsg} />
        </div>
      </Container>
    );
  }

  if (!student) notFound();

  const brandColor = session.user.brandColor ?? undefined;
  const studentName =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";

  return (
    <Container className="max-w-4xl py-8">
      <PageHeader
        title="Add Admission"
        description={`Create a new admission record for ${studentName}`}
        backLabel="Back to Admissions"
      />

      <div className="mt-8">
        <ModifyAdmissionForm
          orgId={session.user.orgId}
          studentId={studentId}
          classMasters={classMasters}
          admissionStatusMasters={admissionStatusMasters}
          frequencyMasters={frequencyMasters}
          brandColor={brandColor}
          mode="create"
        />
      </div>
    </Container>
  );
}
