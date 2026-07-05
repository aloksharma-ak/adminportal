import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAdmissionMasterData,
  getApplicableCharges,
  getStudentAdmissionDetail,
  getStudentDetail,
  type StudentFeeLineItem,
  type FrequencyMaster,
} from "@/app/dashboard/administration/actions";
import AddAdmissionFeeForm from "@/components/administration/AddAdmissionFeeForm";
import { Container } from "@/components";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; admissionId: string }>;
};

export default async function AddAdmissionFeePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id, admissionId } = await params;
  const studentId = Number(id);
  const admId = Number(admissionId);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  if (!Number.isInteger(admId) || admId <= 0) notFound();

  let title = "Add Fee";
  let description = `Admission #${admId}`;
  let grade = "";
  let includeTransport = false;
  let distanceFromSchool = 0;
  let defaultFrequencyId = 0;
  let defaultDiscountPercentage = 0;
  let initialCharges: StudentFeeLineItem[] = [];
  let frequencyMasters: FrequencyMaster[] = [];
  let paymentModeMasters: string[] = [];
  let errorMessage: string | null = null;

  try {
    const [studentResponse, admissionResponse, masterResponse] =
      await Promise.all([
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

    const student = studentResponse?.data;
    const admission = admissionResponse?.data?.admission;
    if (!student || !admission) {
      errorMessage = "Admission record not found.";
    } else {
      const studentName =
        `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
        admission.studentName ||
        "Student";
      title = `Add Fee - ${studentName}`;
      description = `${admission.academicYear || "Admission"} - Class ${
        admission.class || "-"
      }`;
 
      const admissionClass = admission.class?.toLowerCase();
      const matchedClass = masterResponse?.data?.classMasters?.find(
        (classMaster) =>
          Boolean(admissionClass) &&
          (classMaster.classText?.toLowerCase() === admissionClass ||
            classMaster.grade?.toLowerCase() === admissionClass ||
            `${classMaster.grade}-${classMaster.section}`.toLowerCase() ===
              admissionClass),
      );
 
      grade = matchedClass?.grade || admission.class || "";
      includeTransport = admission.isIncludeTransport ?? false;
      distanceFromSchool = admission.distanceFromSchool ?? 0;
      defaultFrequencyId = admission.defaultFrequencyId ?? 0;
      defaultDiscountPercentage =
        admission.defaultDiscountPrecentage ?? 0;
      frequencyMasters = masterResponse?.data?.frequencyMasters ?? [];
      paymentModeMasters = masterResponse?.data?.paymentModeMasters ?? [];

      if (grade) {
        try {
          initialCharges = await getApplicableCharges({
            payload: {
              orgId: session.user.orgId,
              grade,
              includeTransport,
              distanceFromSchool,
              searchText: "",
              count: 10,
            },
            userId: session.user.profileId,
          });
        } catch {
          initialCharges = [];
        }
      }
    }
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Failed to load fee details.";
  }

  return (
    <Container className="py-8">
      <PageHeader
        title={title}
        description={description}
        backLabel="Back to Fee Structure"
      />

      {errorMessage ? (
        <ErrorCard message={errorMessage} />
      ) : (
        <AddAdmissionFeeForm
          orgId={session.user.orgId}
          studentId={studentId}
          admissionId={admId}
          grade={grade}
          includeTransport={includeTransport}
          distanceFromSchool={distanceFromSchool}
          defaultFrequencyId={defaultFrequencyId}
          defaultDiscountPercentage={defaultDiscountPercentage}
          initialCharges={initialCharges}
          brandColor={session.user.brandColor}
          frequencyMasters={frequencyMasters}
          paymentModeMasters={paymentModeMasters}
        />
      )}
    </Container>
  );
}
