"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../controls/data-grid";

export type Student = {
  studentId: number;
  firstName: string;
  lastName: string;
  enrolledClass: string | null;
  isActive: boolean;
  initials: string;
};

const columns: ColumnDef<Student>[] = [
  //   {
  //     accessorKey: "studentId",
  //     header: "Student ID",
  //     cell: ({ getValue }) => (
  //       <a href="" className="font-semibold hover:underline">
  //         {String(getValue())}
  //       </a>
  //     ),
  //   },
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {row.original.initials}
        </div>
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
      columns={columns}
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
        console.log("export rows", rows);
      }}
      defaultPageSize={10}
      className="max-w-8xl mx-auto px-4"
      brandColor={brandColor}
    />
  );
}
