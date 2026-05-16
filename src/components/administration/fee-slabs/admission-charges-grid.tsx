"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../../controls/data-grid";
import type { AdmissionCharge } from "@/app/dashboard/administration/fee-slabs/action";
import Link from "next/link";
import { Eye, Pencil } from "lucide-react";
import { FREQUENCY_MASTER } from "@/app/dashboard/administration/fee-slabs/constants";

const getColumns = (brandColor?: string): ColumnDef<AdmissionCharge>[] => [
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
          href={`/dashboard/administration/fee-slabs/admission-charges/${row.original.chargeId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/administration/fee-slabs/admission-charges/${row.original.chargeId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "chargeId",
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
    accessorKey: "chargeName",
    header: "Charge Name",
    cell: ({ getValue }) => (
      <span className="font-semibold text-slate-900 dark:text-slate-100">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "chargeType",
    header: "Type",
    cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-400">{getValue<string>()}</span>,
  },
  {
    accessorKey: "isRecurring",
    header: "Recurring",
    cell: ({ getValue }) => {
      const recurring = Boolean(getValue());
      return (
        <Badge variant="outline" className="text-xs">
          {recurring ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "frequencyId",
    header: "Frequency",
    cell: ({ getValue }) => {
      const id = getValue<number | null>();
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

export default function AdmissionChargesGrid({
  data,
  brandColor,
}: {
  data: AdmissionCharge[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(() => getColumns(brandColor ?? undefined), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => {
      return (
        s.chargeName.toLowerCase().includes(q) ||
        s.chargeType.toLowerCase().includes(q) ||
        String(s.chargeId).includes(q)
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
      searchPlaceholder="Search by name, type or ID…"
      onExport={(rows) => {
        const headers = ["ID", "Name", "Type", "Recurring", "Amount", "Status"];
        const csvRows = rows.map((s) => [
          s.chargeId,
          s.chargeName,
          s.chargeType,
          s.isRecurring ? "Yes" : "No",
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
          download: "admission-charges.csv",
        }).click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
