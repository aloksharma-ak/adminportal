"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../controls/data-grid";
import type { Student } from "@/app/dashboard/admission/action";
import Link from "next/link";
import { Pencil } from "lucide-react";

const getColumns = (brandColor?: string): ColumnDef<Student>[] => [
  {
    id: "sino",
    header: "#",
    cell: ({ row }) => (
      <span className="text-sm text-slate-500">
        {row.index + 1}
      </span>
    ),
  },

  {
    accessorKey: "studentId",
    header: "Student ID",
    cell: ({ getValue }) => {
      const studentId = getValue<number>();

      return (
        <Badge
          variant="outline"
          style={
            brandColor
              ? {
                borderColor: brandColor,
                backgroundColor: brandColor,
                color: "#fff",
              }
              : undefined
          }
          className="w-12 justify-center"
        >
          {studentId}
        </Badge>
      );
    },
  },

  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="leading-tight">
          <a
            href={`/dashboard/admission/${row.original.studentId}`}
            className="font-semibold hover:underline"
          >
            {row.original.firstName} {row.original.lastName}
          </a>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "enrolledClass",
    header: "Enrolled Class",
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <span>{v}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
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
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },

  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/admission/${row.original.studentId}/edit`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Link>
    ),
  },
];

export default function StudentsGrid({
  data,
  brandColor,
}: {
  data: Student[];
  brandColor: string | undefined;
}) {
  const [search, setSearch] = React.useState("");

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
      subtitle={`${filtered.length} results`}
      data={filtered}
      columns={getColumns(brandColor)}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, id, class..."
      actionsRight={[
        {
          label: "Refresh",
          variant: "outline",
          onClick: () => window.location.reload(),
        },
      ]}
      onExport={(rows) => {
        const headers = ["Student ID", "Name", "Class", "Status"];
        const csvRows = rows.map((s) => [
          s.studentId,
          `${s.firstName} ${s.lastName}`.trim(),
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
        const a = Object.assign(document.createElement("a"), {
          href: url,
          download: "students.csv",
        });
        a.click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={10}
      className="max-w-8xl mx-auto px-4"
      brandColor={brandColor}
    />
  );
}
