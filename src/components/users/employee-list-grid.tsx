"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import Link from "next/link";
import { EmployeeListItem } from "@/app/utils";
import { Pencil } from "lucide-react";

const getColumns = (
  brandColor?: string | null
): ColumnDef<EmployeeListItem>[] => [
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
    accessorKey: "empId",
    header: "Emp ID",
    cell: ({ getValue }) => {
      const empId = getValue<number>();



      return (
        <Badge
          variant="outline"
          style={{
            borderColor: brandColor ?? undefined,
            backgroundColor: brandColor ?? undefined,
            color: "#fff",
          }}
          className="w-12"
        >
          {empId}
        </Badge>
      );
    },
  },

  {
    accessorKey: "empName",
    header: "Employee",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/users/employees/${row.original.empId}`}
        className="font-semibold text-slate-900 dark:text-slate-100 hover:underline"
      >
        {row.original.empName}
      </Link>
    ),
  },

  {
    accessorKey: "userName",
    header: "Username",
    cell: ({ getValue }) => (
      <span className="text-sm">
        {getValue<string | null>() || "—"}
      </span>
    ),
  },

  {
    accessorKey: "roleName",
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant="outline">
        {getValue<string>()}
      </Badge>
    ),
  },

  {
  accessorKey: "isActive",
  header: "Status",
  cell: ({ getValue }) => {
    const active = Boolean(getValue());

    return active ? (
      <Badge
        variant="outline"
        style={{
          borderColor: brandColor ?? undefined,
          backgroundColor: brandColor ?? undefined,
          color: "#fff",
        }}
      >
        Active
      </Badge>
    ) : (
      <Badge variant="outline">
        Inactive
      </Badge>
    );
  },
},

  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/users/employees/${row.original.empId}/edit`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Link>
    ),
  },
];

export default function EmployeeListGrid({
  data,
  brandColor,
}: {
  data: EmployeeListItem[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(
    () => getColumns(brandColor),
    [brandColor]
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((e) =>
      e.empName.toLowerCase().includes(q) ||
      (e.userName ?? "").toLowerCase().includes(q) ||
      e.roleName.toLowerCase().includes(q) ||
      String(e.empId).includes(q)
    );
  }, [data, search]);

  return (
    <DataGrid
      title="Employees"
      subtitle={`${filtered.length} of ${data.length} employees`}
      data={filtered}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, username, role…"
      defaultPageSize={15}
      brandColor={brandColor ?? undefined}
    />
  );
}