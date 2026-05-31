import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  getStudentDetail,
  getStudentAdmissionDetail,
  getAdmissionMasterData,
  ClassMaster,
  AdmissionStatusMaster,
  FrequencyMaster,
} from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import ModifyAdmissionForm from "@/components/administration/ModifyAdmissionForm/ModifyAdmissionForm";

import { Container } from "@/components";

type PageProps = {
  params: Promise<{ id: string; admissionId: string }>;
};

export default async function EditAdmissionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id, admissionId } = await params;
  const studentId = Number(id);
  const admId = Number(admissionId);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  if (!Number.isInteger(admId) || admId <= 0) notFound();

  let student;
  let admission;
  let classMasters: ClassMaster[] = [];
  let admissionStatusMasters: AdmissionStatusMaster[] = [];
  let frequencyMasters: FrequencyMaster[] = [];
  let errorMsg: string | null = null;

  try {
    const studentRes = await getStudentDetail({
      orgId: session.user.orgId,
      studentId,
      userId: session.user.profileId,
    });
    student = studentRes?.data;

    if (student) {
      try {
        const [detailRes, masterRes] = await Promise.all([
          getStudentAdmissionDetail({
            orgId: session.user.orgId,
            admissionId: admId,
            userId: session.user.profileId,
          }),
          getAdmissionMasterData({
            orgId: session.user.orgId,
            userId: session.user.profileId,
          }),
        ]);

        admission = detailRes?.data?.admission;
        classMasters = masterRes?.data?.classMasters ?? [];
        admissionStatusMasters = masterRes?.data?.admissionStatusMasters ?? [];
        frequencyMasters = masterRes?.data?.frequencyMasters ?? [];

        if (!admission) {
          errorMsg = `Admission reference #${admId} not found.`;
        }
      } catch (listErr) {
        errorMsg =
          listErr instanceof Error
            ? listErr.message
            : "Failed to load admission details.";
      }
    } else {
      errorMsg = "Student not found";
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load data";
  }

  if (errorMsg) {
    return (
      <Container className="max-w-4xl py-8">
        <PageHeader
          title="Modify Admission"
          backLabel="Back to Admission Detail"
        />
        <div className="mt-6">
          <ErrorCard message={errorMsg} />
        </div>
      </Container>
    );
  }

  if (!student || !admission) notFound();

  const brandColor = session.user.brandColor ?? undefined;
  const studentName =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";

  return (
    <Container className="max-w-4xl py-8">
      <PageHeader
        title="Modify Admission"
        description={`Editing admission reference #${admId} for ${studentName}`}
        backLabel="Back to Admission Detail"
      />

      <div className="mt-8">
        <ModifyAdmissionForm
          orgId={session.user.orgId}
          studentId={studentId}
          admission={admission}
          classMasters={classMasters}
          admissionStatusMasters={admissionStatusMasters}
          frequencyMasters={frequencyMasters}
          brandColor={brandColor}
        />
      </div>
    </Container>
  );
}
