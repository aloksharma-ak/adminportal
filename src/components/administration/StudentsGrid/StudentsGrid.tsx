"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { DataGrid } from "@/components/controls/DataGrid";
import type { Student } from "@/app/dashboard/administration/actions";
import Link from "next/link";
import { Eye, GraduationCap, Pencil } from "lucide-react";
import { Avatar } from "@/components/shared-ui/Avatar";

const getColumns = (brandColor?: string): ColumnDef<Student>[] => [
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
          href={`/dashboard/administration/admission/${row.original.studentId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/administration/admission/${row.original.studentId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {row.original.currentAdmissionId > 0 && (
          <Link
            href={`/dashboard/administration/admission/${row.original.studentId}/admissions`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            title="Open"
          >
            <GraduationCap className="h-4 w-4" />
          </Link>
        )}
      </div>
    ),
  },
  {
    accessorKey: "studentId",
    header: "ID",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="font-mono text-xs"
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
    accessorKey: "isActive",
    header: "Status",
    cell: ({ getValue }) => {
      const active = Boolean(getValue());
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
              : "border-gray-300 bg-gray-50 text-gray-500"
          }
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar
            src={s.profilePicture}
            firstName={s.firstName}
            lastName={s.lastName}
            initials={s.initials}
            size="sm"
            brandColor={brandColor}
          />
          <div>
            <Link
              href={`/dashboard/administration/admission/${s.studentId}`}
              className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
            >
              {s.firstName} {s.lastName}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "fatherName",
    header: "Father's Name",
    cell: ({ getValue }) => getValue<string>() || "",
  },
  {
    accessorKey: "motherName",
    header: "Mother's Name",
    cell: ({ getValue }) => getValue<string>() || "",
  },
  {
    accessorKey: "enrolledClass",
    header: "Class",
    cell: ({ getValue }) => getValue<string>() || "",
  },
  {
    accessorKey: "currentAdmissionStatus",
    header: "Admission Status",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className={
          getValue<string>()
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
            : "border-gray-300 bg-gray-50 text-gray-500"
        }
      >
        {getValue<string>() || ""}
      </Badge>
    ),
  },
];

export default function StudentsGrid({
  data,
  brandColor,
}: {
  data: Student[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(
    () => getColumns(brandColor ?? undefined),
    [brandColor],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        String(s.studentId).includes(q) ||
        (s.enrolledClass ?? "").toLowerCase().includes(q) ||
        (s.initials ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  return (
    <DataGrid
      title=""
      subtitle={`${filtered.length} of ${data.length} students`}
      data={filtered}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, ID, class…"
      onExport={(rows) => {
        const headers = ["ID", "First Name", "Last Name", "Class", "Status"];
        const csvRows = rows.map((s) => [
          s.studentId,
          s.firstName,
          s.lastName,
          s.enrolledClass ?? "",
          s.isActive ? "Active" : "Inactive",
        ]);
        const csv = [headers, ...csvRows]
          .map((r) =>
            r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
          )
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), {
          href: url,
          download: "students.csv",
        }).click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
