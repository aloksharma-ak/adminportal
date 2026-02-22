"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../controls/data-grid";
import type { Student } from "@/app/dashboard/admission/action";
import Link from "next/link";
import { Eye, Pencil, UserPlus } from "lucide-react";
import { Avatar } from "@/components/shared-ui/avatar";

const getColumns = (brandColor?: string): ColumnDef<Student>[] => [
  {
    id: "sino",
    header: "#",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.index + 1}</span>
    ),
  },
  {
    id: "student",
    header: "Student",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar
            firstName={s.firstName}
            lastName={s.lastName}
            initials={s.initials}
            size="sm"
            brandColor={brandColor}
          />
          <div>
            <Link
              href={`/dashboard/admission/${s.studentId}`}
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
    accessorKey: "studentId",
    header: "ID",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="font-mono text-xs"
        style={brandColor ? { borderColor: brandColor, color: brandColor } : undefined}
      >
        #{getValue<number>()}
      </Badge>
    ),
  },
  {
    accessorKey: "enrolledClass",
    header: "Class",
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <Badge variant="outline" className="text-xs">{v}</Badge>
      ) : (
        <span className="text-slate-400">—</span>
      );
    },
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
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/admission/${row.original.studentId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/admission/${row.original.studentId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
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

  const columns = React.useMemo(() => getColumns(brandColor ?? undefined), [brandColor]);

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
      title="Students"
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
      defaultPageSize={15}
      brandColor={brandColor ?? undefined}
    />
  );
}
