"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "@/components/controls/data-grid";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import type { RolePermission } from "@/app/utils";

const getColumns = (brandColor?: string | null): ColumnDef<RolePermission>[] => [
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
          href={`/dashboard/users/roles/${row.original.id}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View / Edit Permissions"
        >
          <Eye className="h-4 w-4" />
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
              ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
              : "border-slate-300 bg-slate-50 text-slate-500"
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
        href={`/dashboard/users/roles/${row.original.id}`}
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
  data: RolePermission[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(() => getColumns(brandColor), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (r) =>
        r.roleName.toLowerCase().includes(q) || String(r.id).includes(q),
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