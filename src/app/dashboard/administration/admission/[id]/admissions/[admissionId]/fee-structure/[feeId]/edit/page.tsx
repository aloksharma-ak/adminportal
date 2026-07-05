import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAdmissionMasterData,
  getApplicableCharges,
  getStudentAdmissionDetail,
  getStudentDetail,
  getStudentFeeDetails,
  type StudentFeeLineItem,
  type FrequencyMaster,
  type StudentFee,
} from "@/app/dashboard/administration/actions";
import AddAdmissionFeeForm from "@/components/administration/AddAdmissionFeeForm";
import { Container } from "@/components";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string; admissionId: string; feeId: string }>;
};

export default async function EditAdmissionFeePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id, admissionId, feeId } = await params;
  const studentId = Number(id);
  const admId = Number(admissionId);
  const fId = Number(feeId);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  if (!Number.isInteger(admId) || admId <= 0) notFound();
  if (!Number.isInteger(fId) || fId <= 0) notFound();

  let student;
  let admission;
  let grade = "";
  let includeTransport = false;
  let distanceFromSchool = 0;
  let defaultFrequencyId = 0;
  let defaultDiscountPercentage = 0;
  let initialCharges: StudentFeeLineItem[] = [];
  let frequencyMasters: FrequencyMaster[] = [];
  let paymentModeMasters: string[] = [];
  let fee: StudentFee | undefined = undefined;
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
        const [detailRes, masterRes, feeDetails] = await Promise.all([
          getStudentAdmissionDetail({
            orgId: session.user.orgId,
            admissionId: admId,
            userId: session.user.profileId,
          }),
          getAdmissionMasterData({
            orgId: session.user.orgId,
            userId: session.user.profileId,
          }),
          getStudentFeeDetails({
            headerId: fId,
            orgId: session.user.orgId,
            userId: session.user.profileId,
          }),
        ]);

        admission = detailRes?.data?.admission;
        frequencyMasters = masterRes?.data?.frequencyMasters ?? [];
        paymentModeMasters = masterRes?.data?.paymentModeMasters ?? [];
        fee = feeDetails;

        if (!admission) {
          errorMsg = `Admission reference #${admId} not found.`;
        } else if (!fee) {
          errorMsg = `Fee record #${fId} not found.`;
        } else {
          const admissionClass = admission.class?.toLowerCase();
          const matchedClass = masterRes?.data?.classMasters?.find(
            (classMaster) =>
              Boolean(admissionClass) &&
              (classMaster.classText?.toLowerCase() === admissionClass ||
                classMaster.grade?.toLowerCase() === admissionClass ||
                `${classMaster.grade}-${classMaster.section}`.toLowerCase() ===
                  admissionClass),
          );

          grade = matchedClass?.grade || admission.class || "";
          includeTransport = admission.isIncludeTransport ?? false;
          distanceFromSchool = admission.distanceFromSchool ?? admission.defaultDistance ?? 0;

          const freqMasters = masterRes?.data?.frequencyMasters ?? [];
          const admissionFreq = admission.defaultFrequency;
          if (admission.defaultFrequencyId) {
            defaultFrequencyId = admission.defaultFrequencyId;
          } else if (admissionFreq != null) {
            const dfStr = String(admissionFreq).toLowerCase();
            const matched = freqMasters.find(
              (f) =>
                f.name?.toLowerCase() === dfStr ||
                String(f.id) === dfStr,
            );
            defaultFrequencyId = matched ? matched.id : 0;
          } else {
            defaultFrequencyId = 0;
          }

          defaultDiscountPercentage = admission.defaultDiscountPrecentage ?? 0;

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
      } catch (innerErr) {
        errorMsg =
          innerErr instanceof Error
            ? innerErr.message
            : "Failed to load fee details.";
      }
    } else {
      errorMsg = "Student not found";
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : "Failed to load data";
  }

  if (errorMsg) {
    return (
      <Container className="py-8">
        <PageHeader
          title="Edit Fee"
          backLabel="Back to Fee Structure"
        />
        <div className="mt-6">
          <ErrorCard message={errorMsg} />
        </div>
      </Container>
    );
  }

  if (!student || !admission || !fee) notFound();

  const brandColor = session.user.brandColor ?? undefined;
  const studentName =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";

  return (
    <Container className="py-8">
      <PageHeader
        title={`Edit Fee - ${studentName}`}
        description={`${admission.academicYear || "Admission"} - Class ${admission.class || "-"}`}
        backLabel="Back to Fee Structure"
      />

      <div className="mt-8">
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
          brandColor={brandColor}
          frequencyMasters={frequencyMasters}
          paymentModeMasters={paymentModeMasters}
          fee={fee}
        />
      </div>
    </Container>
  );
}
