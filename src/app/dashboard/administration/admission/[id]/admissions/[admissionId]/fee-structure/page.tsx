import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAdmissionFeeList,
  getAdmissionMasterData,
  getStudentAdmissionDetail,
  getStudentDetail,
  type StudentFee,
} from "@/app/dashboard/administration/actions";
import AdmissionFeeStructure from "@/components/administration/AdmissionFeeStructure";
import { Container } from "@/components";
import { ErrorCard } from "@/components/shared-ui/States";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; admissionId: string }>;
};

export default async function AdmissionFeeStructurePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id, admissionId } = await params;
  const studentId = Number(id);
  const admId = Number(admissionId);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  if (!Number.isInteger(admId) || admId <= 0) notFound();

  let fees: StudentFee[] = [];
  let title = "Fee Structure";
  let description = `Admission #${admId}`;
  let grade = "";
  let includeTransport = false;
  let distanceFromSchool = 0;
  let defaultFrequencyId = 0;
  let defaultDiscountPercentage = 0;
  let errorMsg: string | null = null;

  try {
    const [studentRes, admissionRes, masterRes] = await Promise.all([
      getStudentDetail({
        orgId: session.user.orgId,
        studentId,
        userId: session.user.profileId,
      }),
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

    const student = studentRes?.data;
    const admission = admissionRes?.data?.admission;

    if (!student || !admission) {
      errorMsg = "Admission record not found.";
    } else {
      const studentName =
        `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
        admission.studentName ||
        "Student";
      title = `${studentName} Fee Structure`;
      description = `${admission.academicYear || "Admission"} - Class ${
        admission.class || "-"
      }`;
      const matchedClass = masterRes?.data?.classMasters?.find((classMaster) => {
        const admissionClass = admission.class?.toLowerCase();
        if (!admissionClass) return false;

        return (
          classMaster.classText?.toLowerCase() === admissionClass ||
          classMaster.grade?.toLowerCase() === admissionClass ||
          `${classMaster.grade}-${classMaster.section}`.toLowerCase() ===
            admissionClass
        );
      });
      grade = matchedClass?.grade || admission.class || "";
      includeTransport = admission.isIncludeTransport ?? false;
      distanceFromSchool = admission.distanceFromSchool ?? 0;
      defaultFrequencyId = admission.defaultFrequencyId ?? 0;
      defaultDiscountPercentage = admission.defaultDiscountPrecentage ?? 0;

      try {
        fees = await getAdmissionFeeList({
          orgId: session.user.orgId,
          admissionId: admId,
          userId: session.user.profileId,
        });
      } catch (feeErr) {
        errorMsg =
          feeErr instanceof Error
            ? feeErr.message
            : "Failed to load admission fee list.";
      }
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load data.";
  }

  return (
    <Container className="py-8">
      {errorMsg ? (
        <>
          <PageHeader
            title={title}
            description={description}
            backLabel="Back to Admission"
          />
          <ErrorCard message={errorMsg} />
        </>
      ) : (
        <AdmissionFeeStructure
          data={fees}
          orgId={session.user.orgId}
          studentId={studentId}
          admissionId={admId}
          brandColor={session.user.brandColor}
          title={title}
          description={description}
          backLabel="Back to Admission"
          grade={grade}
          includeTransport={includeTransport}
          distanceFromSchool={distanceFromSchool}
          defaultFrequencyId={defaultFrequencyId}
          defaultDiscountPercentage={defaultDiscountPercentage}
        />
      )}
    </Container>
  );
}
