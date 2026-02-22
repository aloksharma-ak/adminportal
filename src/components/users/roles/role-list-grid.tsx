"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import Link from "next/link";
import { Role } from "@/app/utils";
import { Eye, Pencil } from "lucide-react";

const getColumns = (brandColor?: string | null): ColumnDef<Role>[] => [
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
          href={`/dashboard/users/roles/${row.original.roleId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/users/roles/${row.original.roleId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    ),
  },

  {
    accessorKey: "id",
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
              ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950/30"
              : "border-gray-300 bg-gray-50 text-gray-500"
          }
        >
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "roleName",
    header: "Role Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/users/roles/${row.original.roleId}`}
        className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
      >
        {row.original.roleName}
      </Link>
    ),
  },
];

export default function RoleListGrid({
  data,
  brandColor,
}: {
  data: Role[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(() => getColumns(brandColor), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter(
      (r) => r.roleName.toLowerCase().includes(q) || String(r.roleId).includes(q),
    );
  }, [data, search]);

  return (
    <DataGrid
      title=""
      subtitle={`${filtered.length} of ${data.length} roles`}
      data={filtered}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by role name or ID…"
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
