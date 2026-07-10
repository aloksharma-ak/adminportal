"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  modifyAttendanceSession,
  type AttendanceSession,
  type ClassStudent,
} from "@/app/dashboard/academics/actions";
import { getErrorMessage } from "@/app/dashboard/utils";
import { ActionButton } from "@/components/controls/Buttons";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type StatusOption = { value: string; label: string };

type EditableAttendance = {
  studentId: number;
  studentName: string;
  status: number;
  remarks: string;
};

type Props = {
  classId: number;
  orgId: number;
  className: string;
  students: ClassStudent[];
  attendanceSession: AttendanceSession | null;
  statusOptions: StatusOption[];
  brandColor?: string | null;
};

function studentName(student: ClassStudent) {
  return (
    student.studentName ||
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
    `Student #${student.studentId}`
  );
}

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export default function RecordAttendanceWorkspace({
  classId,
  orgId,
  className,
  students,
  attendanceSession,
  statusOptions,
  brandColor,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = React.useState(false);

  // Initialize values based on whether editing or creating
  const attendanceId = attendanceSession ? (attendanceSession.attendanceId ?? attendanceSession.id) : 0;
  const [attendanceDate, setAttendanceDate] = React.useState(() => {
    if (attendanceSession?.date) {
      return attendanceSession.date.slice(0, 10);
    }
    return todayInIndia();
  });

  const [details, setDetails] = React.useState<EditableAttendance[]>(() => {
    const detailMap = new Map(
      (attendanceSession?.details ?? []).map((item) => [item.studentId, item])
    );
    return students.map((student) => {
      const detail = detailMap.get(student.studentId);
      return {
        studentId: student.studentId,
        studentName: studentName(student),
        status: detail?.status ?? Number(statusOptions[0]?.value ?? 1),
        remarks: detail?.remarks ?? "",
      };
    });
  });

  React.useEffect(() => {
    const detailMap = new Map(
      (attendanceSession?.details ?? []).map((item) => [item.studentId, item])
    );
    setDetails((current) =>
      students.map((student) => {
        const existing = current.find(
          (item) => item.studentId === student.studentId,
        );
        if (existing) return existing;

        const detail = detailMap.get(student.studentId);
        return {
          studentId: student.studentId,
          studentName: studentName(student),
          status: detail?.status ?? Number(statusOptions[0]?.value ?? 1),
          remarks: detail?.remarks ?? "",
        };
      }),
    );
  }, [statusOptions, students, attendanceSession]);

  const updateDetail = (
    studentId: number,
    patch: Partial<EditableAttendance>,
  ) => {
    setDetails((current) =>
      current.map((item) =>
        item.studentId === studentId ? { ...item, ...patch } : item,
      ),
    );
  };

  const saveAttendance = async () => {
    if (!attendanceDate) {
      toast.error("Attendance date is required.");
      return;
    }
    if (details.length === 0) {
      toast.error("No students found for this class.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving attendance...");
    try {
      const response = await modifyAttendanceSession({
        attendance: {
          id: attendanceId,
          classId,
          orgId,
          date: attendanceDate,
          details: details.map((item) => ({
            studentId: item.studentId,
            status: item.status,
            remarks: item.remarks.trim(),
          })),
        },
        userId: session?.user?.profileId,
      });
      if (!response.status) {
        throw new Error(response.message || "Unable to save attendance.");
      }

      toast.success(response.message || "Attendance saved successfully.", {
        id: toastId,
      });
      router.push(`/dashboard/academics/classes/${classId}/attendance`);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={attendanceId ? `Edit Session #${attendanceId}` : "New Session"}
        description={`Record daily student attendance for ${className}`}
        backLabel="Back to Attendance Sessions"
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              {attendanceId ? `Edit Session #${attendanceId}` : "New Session"}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="attendance-date">Attendance Date</Label>
              <Input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
              />
            </div>
            <ActionButton
              type="button"
              color={brandColor ?? "blue"}
              leftIcon={<Save className="h-4 w-4" />}
              loading={saving}
              disabled={saving}
              onClick={saveAttendance}
            >
              Save Attendance
            </ActionButton>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {details.length > 0 ? (
                details.map((detail) => (
                  <TableRow key={detail.studentId}>
                    <TableCell className="pl-6 font-medium">
                      {detail.studentName}
                    </TableCell>
                    <TableCell>
                      <DropdownFilter
                        value={String(detail.status)}
                        onChange={(value) =>
                          updateDetail(detail.studentId, {
                            status: Number(value) || 0,
                          })
                        }
                        options={statusOptions}
                        allowClear={false}
                        className="w-40"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={detail.remarks}
                        onChange={(event) =>
                          updateDetail(detail.studentId, {
                            remarks: event.target.value,
                          })
                        }
                        placeholder="Optional remarks"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No students found for this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
