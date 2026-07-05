import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import {
  getAdmissionMasterData,
  getStudentAdmissionDetail,
  getStudentDetail,
  getStudentFeeDetails,
  type StudentFee,
  type FrequencyMaster,
} from "@/app/dashboard/administration/actions";
import { Container } from "@/components";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { LinkButton } from "@/components/controls/Buttons";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";
import * as React from "react";

type PageProps = {
  params: Promise<{ id: string; admissionId: string; feeId: string }>;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthName(val: number) {
  if (!val) return "-";
  const idx = (val - 1) % 12;
  return monthOptions[idx] || "-";
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {value === "" || value === null || value === undefined
          ? "-"
          : String(value)}
      </div>
    </div>
  );
}

export default async function ViewAdmissionFeePage({ params }: PageProps) {
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
  let fee: StudentFee | undefined = undefined;
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
        fee = feeDetails;

        if (!admission) {
          errorMsg = `Admission reference #${admId} not found.`;
        } else if (!fee) {
          errorMsg = `Fee record #${fId} not found.`;
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
        <PageHeader title="View Fee" backLabel="Back to Fee Structure" />
        <div className="mt-6">
          <ErrorCard message={errorMsg} />
        </div>
      </Container>
    );
  }

  if (!student || !admission || !fee) notFound();

  const studentName =
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || "Student";

  const totalFinalAmount = fee.totalAmount || 0;
  const defaultDiscountAmount =
    Math.round(
      ((totalFinalAmount * (fee.defaultDiscountPercentage || 0)) / 100) * 100,
    ) / 100;
  const additionalDiscount = Math.max(
    (fee.discountAmount || 0) - defaultDiscountAmount,
    0,
  );

  console.log("------------------>", JSON.stringify(fee, null, 2));

  return (
    <Container className="py-8">
      <PageHeader
        title={`View Fee - ${studentName}`}
        description={`${admission.academicYear || "Admission"} - Class ${admission.class || "-"}`}
        backLabel="Back to Fee Structure"
        // actions={
        //   <LinkButton
        //     color={session.user.brandColor ?? "blue"}
        //     leftIcon={<Pencil className="h-4 w-4" />}
        //     href={`/dashboard/administration/admission/${studentId}/admissions/${admissionId}/fee-structure/${fId}/edit`}
        //   >
        //     Edit Fee
        //   </LinkButton>
        // }
      />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Header</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
            <ReadonlyField label="Org ID" value={fee.orgId} />
            <ReadonlyField label="Admission ID" value={fee.admissionId} />
            <ReadonlyField label="Student ID" value={fee.studentId} />
            <ReadonlyField label="Receipt No" value={fee.receiptNo || "-"} />
            <ReadonlyField
              label="Transaction Date"
              value={
                fee.transactionDate
                  ? new Date(fee.transactionDate).toLocaleString("en-IN")
                  : "-"
              }
            />
            <ReadonlyField
              label="Payment Mode"
              value={fee.paymentMode || "-"}
            />
            <ReadonlyField
              label="Transport"
              value={fee.isTransportInclude ? "Included" : "Not Included"}
            />
            <ReadonlyField
              label="Distance From School"
              value={`${fee.distanceFromSchool || 0} km`}
            />
            <ReadonlyField
              label="Discount %"
              value={`${fee.defaultDiscountPercentage || 0}%`}
            />
            <ReadonlyField label="Remarks" value={fee.remarks || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Line Items</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Charge</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>From Month</TableHead>
                  <TableHead>To Month</TableHead>
                  <TableHead className="text-right">Base Amount</TableHead>
                  <TableHead className="text-right">Transport Amount</TableHead>
                  <TableHead className="text-right pr-6">
                    Final Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fee.feeLineItems && fee.feeLineItems.length > 0 ? (
                  fee.feeLineItems.map((item) => {
                    const freqName =
                      frequencyMasters.find((f) => f.id == item.frequencyId)
                        ?.name ||
                      item.frequencyId ||
                      "-";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="pl-6 font-medium">
                          {item.chargeName}
                        </TableCell>
                        <TableCell>{item.chargeType || "-"}</TableCell>
                        <TableCell>{freqName}</TableCell>
                        <TableCell>{getMonthName(item.fromMonth)}</TableCell>
                        <TableCell>
                          {getMonthName(item.fromMonth + item.monthsInterval)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency.format(item.baseAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency.format(item.transportAmount)}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-semibold">
                          {currency.format(item.finalAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-slate-500"
                    >
                      No fee line items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Final Amount
              </span>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                {currency.format(totalFinalAmount)}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Default Discount Amount
              </span>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                {currency.format(defaultDiscountAmount)}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Additional Discount
              </span>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                {currency.format(additionalDiscount)}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Paid Amount
              </span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {currency.format(fee.paidAmount || 0)}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Amount
              </span>
              <div className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
                {currency.format(fee.pendingAmount || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <LinkButton
            color="slate"
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            href={`/dashboard/administration/admission/${studentId}/admissions/${admId}/fee-structure`}
          >
            Back to Fee Structure
          </LinkButton>
        </div>
      </div>
    </Container>
  );
}
