"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../../controls/data-grid";
import type { TransportCharge } from "@/app/dashboard/administration/fee-slabs/action";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { FREQUENCY_MASTER } from "@/app/dashboard/administration/fee-slabs/constants";

const getColumns = (brandColor?: string): ColumnDef<TransportCharge>[] => [
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
          href={`/dashboard/administration/fee-slabs/transport-charges/${row.original.id}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/administration/fee-slabs/transport-charges/${row.original.id}/edit`}
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
        style={brandColor ? { borderColor: brandColor, color: brandColor } : undefined}
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
    accessorKey: "fromKM",
    header: "From (KM)",
    cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<number>()} km</span>,
  },
  {
    accessorKey: "toKM",
    header: "To (KM)",
    cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-slate-100">{getValue<number>()} km</span>,
  },
  {
    accessorKey: "frequencyId",
    header: "Frequency",
    cell: ({ getValue }) => {
      const id = getValue<number>();
      const freq = FREQUENCY_MASTER.find(f => f.id === id);
      return freq ? freq.name : <span className="text-slate-400">—</span>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        ₹{getValue<number>().toLocaleString()}
      </span>
    ),
  },
];

export default function TransportChargesGrid({
  data,
  brandColor,
}: {
  data: TransportCharge[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(() => getColumns(brandColor ?? undefined), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => {
      return (
        String(s.fromKM).includes(q) ||
        String(s.toKM).includes(q) ||
        String(s.id).includes(q)
      );
    });
  }, [data, search]);

  return (
    <DataGrid
      title=""
      subtitle={`${filtered.length} of ${data.length} charges`}
      data={filtered}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by distance or ID…"
      onExport={(rows) => {
        const headers = ["ID", "From (KM)", "To (KM)", "Frequency", "Amount", "Status"];
        const csvRows = rows.map((s) => [
          s.id,
          s.fromKM,
          s.toKM,
          FREQUENCY_MASTER.find(f => f.id === s.frequencyId)?.name ?? "",
          s.amount,
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
          download: "transport-charges.csv",
        }).click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
