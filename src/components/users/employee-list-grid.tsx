"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import type { EmployeeListItem } from "@/app/utils";
import Link from "next/link";

const columns: ColumnDef<EmployeeListItem>[] = [
  {
    id: "name",
    header: "Employee",
    cell: ({ row }) => {
      const e = row.original;
      const fullName = [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {e.initials || fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/users/employees/${e.empId}`}
              className="block truncate font-semibold text-slate-900 dark:text-slate-100 hover:underline"
            >
              {fullName}
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">{e.email || "—"}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => {
      const v = getValue<string>();
      return <span className="text-sm">{v || "—"}</span>;
    },
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role?.roleName;
      return roleName ? (
        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {roleName}
        </Badge>
      ) : (
        <span className="text-xs text-slate-400">—</span>
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
          className={active
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-slate-200 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
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

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((e) => {
      const name = [e.firstName, e.middleName, e.lastName].join(" ").toLowerCase();
      return (
        name.includes(q) ||
        (e.email ?? "").toLowerCase().includes(q) ||
        (e.phone ?? "").includes(q) ||
        (e.role?.roleName ?? "").toLowerCase().includes(q) ||
        String(e.empId).includes(q)
      );
    });
  }, [data, search]);

  return (
    <DataGrid
      title="Employees"
      subtitle={`${filtered.length} of ${data.length} employees`}
      data={filtered}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, email, role…"
      actionsRight={[{
        label: "Refresh",
        variant: "outline",
        onClick: () => window.location.reload(),
      }]}
      onExport={(rows) => {
        const headers = ["Emp ID", "Name", "Email", "Phone", "Role", "Status"];
        const csvRows = rows.map((e) => [
          e.empId,
          [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" "),
          e.email ?? "",
          e.phone ?? "",
          e.role?.roleName ?? "",
          e.isActive ? "Active" : "Inactive",
        ]);
        const csv = [headers, ...csvRows]
          .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), { href: url, download: "employees.csv" });
        a.click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={15}
      brandColor={brandColor ?? undefined}
    />
  );
}
