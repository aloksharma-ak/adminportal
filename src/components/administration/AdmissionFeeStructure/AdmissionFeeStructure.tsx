"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ClipboardPlus, Pencil, Eye } from "lucide-react";
import Link from "next/link";

import { type StudentFee } from "@/app/dashboard/administration/actions";
import { LinkButton } from "@/components/controls/Buttons";
import { DataGrid } from "@/components/controls/DataGrid";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Props = {
  data: StudentFee[];
  orgId: number;
  studentId: number;
  admissionId: number;
  brandColor?: string | null;
  title: string;
  description?: string;
  backLabel?: string;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool?: number;
  defaultFrequencyId?: number;
  defaultDiscountPercentage?: number;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function getColumns(
  studentId: number,
  admissionId: number,
): ColumnDef<StudentFee>[] {
  return [
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
        <div className="flex items-center gap-1">
          <Link
            href={`/dashboard/administration/admission/${studentId}/admissions/${admissionId}/fee-structure/${row.original.id}`}
          >
            <Button type="button" variant="ghost" size="icon" title="View fee">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {/* <Link
            href={`/dashboard/administration/admission/${studentId}/admissions/${admissionId}/fee-structure/${row.original.id}/edit`}
          >
            <Button type="button" variant="ghost" size="icon" title="Edit fee">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link> */}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Fee ID",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="font-mono text-xs">
          #{getValue<number>()}
        </Badge>
      ),
    },
    {
      accessorKey: "receiptNo",
      header: "Receipt No",
      cell: ({ getValue }) => getValue<string>() || "-",
    },
    {
      accessorKey: "transactionDate",
      header: "Date",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return value ? new Date(value).toLocaleDateString("en-IN") : "-";
      },
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
      cell: ({ getValue }) => getValue<string>() || "-",
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ getValue }) => currency.format(getValue<number>() ?? 0),
    },
    {
      accessorKey: "discountAmount",
      header: "Discount",
      cell: ({ getValue }) => currency.format(getValue<number>() ?? 0),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ getValue }) => (
        <span className="font-semibold text-emerald-700">
          {currency.format(getValue<number>() ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: "pendingAmount",
      header: "Pending",
      cell: ({ getValue }) => (
        <span className="font-semibold text-amber-700">
          {currency.format(getValue<number>() ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: "isTransportInclude",
      header: "Transport",
      cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
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
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-300 bg-gray-50 text-gray-500"
            }
          >
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
  ];
}

export default function AdmissionFeeStructure({
  data,
  studentId,
  admissionId,
  brandColor,
  title,
  description,
  backLabel = "Back to Admission",
}: Props) {
  const [search, setSearch] = React.useState("");

  const columns = React.useMemo(
    () => getColumns(studentId, admissionId),
    [studentId, admissionId],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((fee) =>
      [
        fee.id,
        fee.receiptNo,
        fee.paymentMode,
        fee.remarks,
        fee.totalAmount,
        fee.paidAmount,
        fee.pendingAmount,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [data, search]);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        backLabel={backLabel}
        actions={
          <LinkButton
            color={brandColor ?? "blue"}
            leftIcon={<ClipboardPlus className="h-4 w-4" />}
            href={`/dashboard/administration/admission/${studentId}/admissions/${admissionId}/fee-structure/add`}
          >
            Add Fee
          </LinkButton>
        }
      />

      <DataGrid
        title="Fees"
        subtitle={`${filtered.length} of ${data.length} fees`}
        data={filtered}
        columns={columns}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search receipt, mode, amount..."
        defaultPageSize={10}
        brandColor={brandColor ?? undefined}
      />
    </>
  );
}
