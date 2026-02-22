"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import Link from "next/link";
import { EmployeeListItem } from "@/app/utils";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";

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
      cell: ({ row, getValue }) => {
        const empId = getValue<number>();



        return (
          <Badge
            variant="outline"
            style={{
              borderColor: brandColor ?? undefined,
              backgroundColor: brandColor ?? undefined,
              color: "#fff",
            }}
            className="w-12 cursor-pointer"
            onClick={() => redirect(`/dashboard/users/employees/${row.original.empId}`)}
          >
            {empId}
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
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          <Pencil className="h-4 w-4" />

        </Link>
      ),
    },

    {
      accessorKey: "empName",
      header: "Employee",
      cell: ({ row }) => (
        <span
          className="font-semibold text-slate-900 dark:text-slate-100"
        >
          {row.original.empName}
        </span>
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

        return (
          <Badge
            variant="outline"
            className={
              active
                ? "border-green-500 text-green-600 bg-green-50"
                : "border-gray-400 text-gray-500 bg-gray-50"
            }
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    }


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