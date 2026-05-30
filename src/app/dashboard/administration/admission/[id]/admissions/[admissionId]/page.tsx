import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import {
  getStudentDetail,
  getStudentAdmissionDetail,
} from "@/app/dashboard/administration/actions";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { ErrorCard } from "@/components/shared-ui/States";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Truck,
  Shield,
  Clock,
  Landmark,
  User,
  Pencil,
} from "lucide-react";

import { Container } from "@/components";

type PageProps = {
  params: Promise<{ id: string; admissionId: string }>;
};

export default async function AdmissionDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const { id, admissionId } = await params;
  const studentId = Number(id);
  const admId = Number(admissionId);

  if (!Number.isInteger(studentId) || studentId <= 0) notFound();
  if (!Number.isInteger(admId) || admId <= 0) notFound();

  let student;
  let admission;
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
        const detailRes = await getStudentAdmissionDetail({
          orgId: session.user.orgId,
          admissionId: admId,
          userId: session.user.profileId,
        });
        admission = detailRes?.data?.admission;
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
      <Container className="py-8">
        <PageHeader title="Admission Detail" backLabel="Back to Admissions" />
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
  const isEnrolled = admission.status?.toLowerCase() === "enrolled";

  return (
    <Container className="py-8">
      <PageHeader
        title={`Admission Record Details`}
        backLabel="Back to Admissions List"
        actions={
          <Link
            href={`/dashboard/administration/admission/${studentId}/admissions/${admId}/edit`}
          >
            <Button
              className="h-10 rounded-2xl px-4 font-semibold text-sm flex items-center gap-1.5 shadow-sm text-white hover:opacity-90 transition"
              style={{ backgroundColor: brandColor }}
            >
              <Pencil className="h-4 w-4" />
              Edit Record
            </Button>
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left main info card */}
        <Card className="md:col-span-2 overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 dark:border-slate-800 dark:bg-slate-900/20">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <GraduationCap className="h-5 w-5 text-slate-400" />
              Enrollment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Student Name
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  {admission.studentName || studentName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Academic Year
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  {admission.academicYear || "—"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Class Enrolled
                </span>
                <div className="mt-0.5">
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    Class {admission.class || "—"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Admission Date & Time
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  {admission.admissionDate
                    ? new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      }).format(new Date(admission.admissionDate))
                    : "—"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Transport Status
                </span>
                <div className="mt-0.5">
                  {admission.isIncludeTransport ? (
                    <Badge
                      className="inline-flex items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400"
                      variant="outline"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      Transport Included
                    </Badge>
                  ) : (
                    <Badge
                      className="inline-flex items-center gap-1 border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                      variant="outline"
                    >
                      Not Included
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Admission Status
                </span>
                <div className="mt-0.5">
                  <Badge
                    className={`font-semibold ${
                      isEnrolled
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30"
                        : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/30"
                    }`}
                    variant="outline"
                  >
                    {admission.status || "—"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side widgets card */}
        <div className="space-y-6">
          <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 dark:border-slate-800 dark:bg-slate-900/20">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Shield className="h-5 w-5 text-slate-400" />
                System Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Admission ID
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-semibold"
                  style={
                    brandColor
                      ? { borderColor: brandColor, color: brandColor }
                      : undefined
                  }
                >
                  #{admission.admissionId}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Organization Ref ID
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-slate-400" />#
                  {admission.orgId || "—"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {admission.isActive ? (
                    <>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/25" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="font-semibold text-slate-500">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
