"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, Pencil, Eye } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  type AttendanceSession,
  type ClassStudent,
} from "@/app/dashboard/academics/actions";
import { ActionButton } from "@/components/controls/Buttons";
import { DataGrid } from "@/components/controls/DataGrid";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type StatusOption = { value: string; label: string };

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
  errorMessage?: string | null;
};

function sessionId(session: AttendanceSession) {
  return session.attendanceId ?? session.id;
}

function sessionColumns(
  onEdit: (session: AttendanceSession) => void,
  onView: (session: AttendanceSession) => void,
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
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="View attendance"
            onClick={() => onView(row.original)}
          >
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Edit attendance"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
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
      id: "totalStudents",
      header: "Total Students",
      cell: ({ row }) => {
        const present = row.original.totalPresent ?? row.original.presentCount ?? 0;
        const absent = row.original.totalAbsent ?? row.original.absentCount ?? 0;
        const markedCount = present + absent;
        return markedCount > 0 ? markedCount : (row.original.totalStudent ?? 0);
      },
    },
    {
      id: "presentCount",
      header: "Present",
      cell: ({ row }) => {
        return row.original.totalPresent ?? row.original.presentCount ?? "-";
      },
    },
    {
      id: "absentCount",
      header: "Absent",
      cell: ({ row }) => {
        return row.original.totalAbsent ?? row.original.absentCount ?? "-";
      },
    },
  ];
}

export default function AttendanceWorkspace({
  classId,
  className,
  sessions,
  initialFromDate,
  initialToDate,
  brandColor,
  errorMessage,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fromDate, setFromDate] = React.useState(initialFromDate);
  const [toDate, setToDate] = React.useState(initialToDate);
  const [isPending, startTransition] = React.useTransition();

  const editSession = React.useCallback(
    (value: AttendanceSession) => {
      router.push(`/dashboard/academics/classes/${classId}/attendance/record?id=${sessionId(value)}&mode=edit`);
    },
    [router, classId],
  );

  const viewSession = React.useCallback(
    (value: AttendanceSession) => {
      router.push(`/dashboard/academics/classes/${classId}/attendance/record?id=${sessionId(value)}&mode=view`);
    },
    [router, classId],
  );

  const columns = React.useMemo(
    () => sessionColumns(editSession, viewSession),
    [editSession, viewSession],
  );

  const applyDateFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("fromDate", fromDate);
      params.set("toDate", toDate);
      router.replace(`${pathname}?${params.toString()}`);
      router.refresh();
    });
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
            onClick={() => router.push(`/dashboard/academics/classes/${classId}/attendance/record`)}
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
          <ActionButton
            type="button"
            color={brandColor ?? "blue"}
            loading={isPending}
            onClick={applyDateFilter}
          >
            Load Attendance
          </ActionButton>
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
          errorMessage={errorMessage}
        />
      </div>
    </>
  );
}

