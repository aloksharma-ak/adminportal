"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import Link from "next/link";
import { EmployeeListItem } from "@/app/utils";
import { Eye, Pencil } from "lucide-react";
import { Avatar } from "@/components/shared-ui/avatar";

const getColumns = (brandColor?: string | null): ColumnDef<EmployeeListItem>[] => [
  {
    id: "sino",
    header: "#",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.index + 1}</span>
    ),
  },
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const e = row.original;
      const [firstName, ...rest] = (e.empName ?? "").split(" ");
      const lastName = rest.join(" ");
      return (
        <div className="flex items-center gap-3">
          <Avatar
            firstName={firstName}
            lastName={lastName}
            initials={e.initials}
            size="sm"
            brandColor={brandColor}
          />
          <div>
            <Link
              href={`/dashboard/users/employees/${e.empId}`}
              className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
            >
              {e.empName}
            </Link>
            {e.userName && (
              <p className="text-xs text-slate-500">@{e.userName}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "empId",
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
    accessorKey: "roleName",
    header: "Role",
    cell: ({ getValue }) => (
      <Badge variant="outline" className="text-xs">{getValue<string>()}</Badge>
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
          className={active
            ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/30"
            : "border-gray-300 bg-gray-50 text-gray-500"}
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
          href={`/dashboard/users/employees/${row.original.empId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/users/employees/${row.original.empId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
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

  const columns = React.useMemo(() => getColumns(brandColor), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (e) =>
        e.empName.toLowerCase().includes(q) ||
        (e.userName ?? "").toLowerCase().includes(q) ||
        e.roleName.toLowerCase().includes(q) ||
        String(e.empId).includes(q),
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
