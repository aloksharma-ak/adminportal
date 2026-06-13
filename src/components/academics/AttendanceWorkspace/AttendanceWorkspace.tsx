"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, Pencil, Save } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  getAttendanceDetail,
  modifyAttendanceSession,
  type AttendanceDetail,
  type AttendanceSession,
  type ClassStudent,
} from "@/app/dashboard/academics/actions";
import { getErrorMessage } from "@/app/dashboard/utils";
import { ActionButton } from "@/components/controls/Buttons";
import { DataGrid } from "@/components/controls/DataGrid";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  sessions: AttendanceSession[];
  statusOptions: StatusOption[];
  initialFromDate: string;
  initialToDate: string;
  brandColor?: string | null;
};

function studentName(student: ClassStudent) {
  return (
    student.studentName ||
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
    `Student #${student.studentId}`
  );
}

function sessionId(session: AttendanceSession) {
  return session.attendanceId ?? session.id;
}

function sessionColumns(
  onEdit: (session: AttendanceSession) => void,
): ColumnDef<AttendanceSession>[] {
  return [
    {
      id: "serial",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title="Edit attendance"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return value ? new Date(value).toLocaleDateString("en-IN") : "-";
      },
    },
    {
      id: "attendanceId",
      header: "Attendance ID",
      cell: ({ row }) => (
        <Badge variant="outline">#{sessionId(row.original)}</Badge>
      ),
    },
    {
      accessorKey: "presentCount",
      header: "Present",
      cell: ({ getValue }) => getValue<number>() ?? "-",
    },
    {
      accessorKey: "absentCount",
      header: "Absent",
      cell: ({ getValue }) => getValue<number>() ?? "-",
    },
  ];
}

export default function AttendanceWorkspace({
  classId,
  orgId,
  className,
  students,
  sessions,
  statusOptions,
  initialFromDate,
  initialToDate,
  brandColor,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [fromDate, setFromDate] = React.useState(initialFromDate);
  const [toDate, setToDate] = React.useState(initialToDate);
  const [attendanceId, setAttendanceId] = React.useState(0);
  const [attendanceDate, setAttendanceDate] = React.useState(initialToDate);
  const [saving, setSaving] = React.useState(false);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [details, setDetails] = React.useState<EditableAttendance[]>(() =>
    students.map((student) => ({
      studentId: student.studentId,
      studentName: studentName(student),
      status: Number(statusOptions[0]?.value ?? 1),
      remarks: "",
    })),
  );

  React.useEffect(() => {
    setDetails((current) =>
      students.map((student) => {
        const existing = current.find(
          (item) => item.studentId === student.studentId,
        );
        return (
          existing ?? {
            studentId: student.studentId,
            studentName: studentName(student),
            status: Number(statusOptions[0]?.value ?? 1),
            remarks: "",
          }
        );
      }),
    );
  }, [statusOptions, students]);

  const applyDetail = React.useCallback(
    (attendance: AttendanceSession) => {
      const detailMap = new Map<number, AttendanceDetail>(
        (attendance.details ?? []).map((item) => [item.studentId, item]),
      );
      setAttendanceId(sessionId(attendance));
      setAttendanceDate(attendance.date?.slice(0, 10) || initialToDate);
      setDetails(
        students.map((student) => {
          const detail = detailMap.get(student.studentId);
          return {
            studentId: student.studentId,
            studentName: studentName(student),
            status: detail?.status ?? Number(statusOptions[0]?.value ?? 1),
            remarks: detail?.remarks ?? "",
          };
        }),
      );
    },
    [initialToDate, statusOptions, students],
  );

  const editSession = React.useCallback(
    async (value: AttendanceSession) => {
      setLoadingDetail(true);
      const toastId = toast.loading("Loading attendance details...");
      try {
        const detail = await getAttendanceDetail({
          attendanceId: sessionId(value),
          orgId,
          userId: session?.user?.profileId,
        });
        applyDetail(detail ?? value);
        toast.success("Attendance details loaded.", { id: toastId });
      } catch (error) {
        toast.error(getErrorMessage(error), { id: toastId });
      } finally {
        setLoadingDetail(false);
      }
    },
    [applyDetail, orgId, session?.user?.profileId],
  );

  const columns = React.useMemo(
    () => sessionColumns(editSession),
    [editSession],
  );

  const applyDateFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("fromDate", fromDate);
    params.set("toDate", toDate);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const createNewSession = () => {
    setAttendanceId(0);
    setAttendanceDate(toDate);
    setDetails(
      students.map((student) => ({
        studentId: student.studentId,
        studentName: studentName(student),
        status: Number(statusOptions[0]?.value ?? 1),
        remarks: "",
      })),
    );
  };

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
        title={`${className} Attendance`}
        description="Review sessions and mark daily student attendance"
        backLabel="Back to Classes"
        actions={
          <ActionButton
            type="button"
            color={brandColor ?? "blue"}
            leftIcon={<CalendarCheck className="h-4 w-4" />}
            onClick={createNewSession}
          >
            New Session
          </ActionButton>
        }
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Label htmlFor="attendance-from">From Date</Label>
            <Input
              id="attendance-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-to">To Date</Label>
            <Input
              id="attendance-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <Button type="button" onClick={applyDateFilter}>
            Load Attendance
          </Button>
        </CardContent>
      </Card>

      <div className="mb-6">
        <DataGrid
          title="Attendance Sessions"
          subtitle={`${sessions.length} sessions`}
          data={sessions}
          columns={columns}
          defaultPageSize={10}
          brandColor={brandColor ?? undefined}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {attendanceId ? `Edit Session #${attendanceId}` : "New Session"}
            </CardTitle>
          </div>
          <div className="flex items-end gap-3">
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
              disabled={saving || loadingDetail}
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
