"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataGrid } from "../../controls/data-grid";
import type { FeeCharge } from "@/app/dashboard/administration/fee-slabs/action";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { FREQUENCY_MASTER } from "@/app/dashboard/administration/fee-slabs/constants";

const getColumns = (brandColor?: string): ColumnDef<FeeCharge>[] => [
  {
    id: "sino",
    header: "#",
    cell: ({ row }) => (
      <span className="text-sm text-slate-400">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/administration/fee-slabs/fee-charges/${row.original.feeChargeId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    ),
  },
];

export default function FeeChargesGrid({
  data,
  brandColor,
}: {
  data: FeeCharge[];
  brandColor?: string | null;
}) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(() => getColumns(brandColor ?? undefined), [brandColor]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => {
      return (
        s.grade.toLowerCase().includes(q)
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
      searchPlaceholder="Search by grade…"
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
