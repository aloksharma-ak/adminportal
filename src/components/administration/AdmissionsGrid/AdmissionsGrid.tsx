"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { DataGrid } from "@/components/controls/DataGrid";
import type { StudentAdmission } from "@/app/dashboard/administration/actions";
import { Calendar, GraduationCap, Truck, Eye } from "lucide-react";
import Link from "next/link";

type AdmissionsGridProps = {
  admissions: StudentAdmission[];
  studentId: number;
  brandColor?: string;
};

export default function AdmissionsGrid({
  admissions,
  studentId,
  brandColor,
}: AdmissionsGridProps) {
  const columns = React.useMemo<ColumnDef<StudentAdmission>[]>(
    () => [
      {
        id: "sino",
        header: "#",
        cell: ({ row }) => (
          <span className="text-sm text-slate-400">{row.index + 1}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/administration/admission/details/${studentId}/admissions/${row.original.admissionId}`}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              title="View Admission Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
      {
        accessorKey: "admissionId",
        header: "Admission ID",
        cell: ({ getValue }) => (
          <Badge
            variant="outline"
            className="font-mono text-xs font-semibold"
            style={
              brandColor
                ? { borderColor: brandColor, color: brandColor }
                : undefined
            }
          >
            #{getValue<number>()}
          </Badge>
        ),
      },
      {
        accessorKey: "academicYear",
        header: "Academic Year",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            {getValue<string>() || "—"}
          </div>
        ),
      },
      {
        accessorKey: "class",
        header: "Class Enrolled",
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              Class {getValue<string>() || "—"}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "admissionDate",
        header: "Admission Date",
        cell: ({ getValue }) => {
          const val = getValue<string>();
          return (
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {val
                ? new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(val))
                : "—"}
            </span>
          );
        },
      },
      {
        accessorKey: "isIncludeTransport",
        header: "Transport Included",
        cell: ({ getValue }) => {
          const val = Boolean(getValue());
          return val ? (
            <Badge
              className="inline-flex items-center gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
              variant="outline"
            >
              <Truck className="h-3.5 w-3.5" />
              Yes
            </Badge>
          ) : (
            <Badge
              className="inline-flex items-center gap-1 border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              variant="outline"
            >
              No
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const val = getValue<string>();
          const isEnrolled = val?.toLowerCase() === "enrolled";
          return (
            <Badge
              className={
                isEnrolled
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400"
              }
              variant="outline"
            >
              {val || "—"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/25" />
          ) : (
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          ),
      },
    ],
    [studentId, brandColor],
  );

  return (
    <DataGrid
      title="Admission Records"
      subtitle="Manage and view academic registrations"
      data={admissions}
      columns={columns}
      brandColor={brandColor}
      searchPlaceholder="Search academic year or class..."
    />
  );
}
