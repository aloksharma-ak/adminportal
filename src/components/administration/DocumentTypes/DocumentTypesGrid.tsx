"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil } from "lucide-react";
import { DataGrid } from "@/components/controls/DataGrid";
import { Badge } from "@/components/ui/Badge";
import type { DocumentType } from "@/app/dashboard/administration/actions";

export default function DocumentTypesGrid({ data, brandColor }: { data: DocumentType[]; brandColor?: string | null }) {
  const [search, setSearch] = React.useState("");
  const columns = React.useMemo<ColumnDef<DocumentType>[]>(() => [
    { accessorKey: "id", header: "ID", cell: ({ getValue }) => <Badge variant="outline">#{getValue<number>()}</Badge> },
    { accessorKey: "documentType", header: "Document Type Name" },
    { accessorKey: "moduleId", header: "Module ID" },
    { accessorKey: "isActive", header: "Status", cell: ({ getValue }) => getValue<boolean>() ? "Active" : "Inactive" },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-2"><Link title="View" href={`/dashboard/administration/document-types/${row.original.id}`}><Eye className="h-4 w-4" /></Link><Link title="Edit" href={`/dashboard/administration/document-types/${row.original.id}/edit`}><Pencil className="h-4 w-4" /></Link></div> },
  ], []);
  const filtered = data.filter((item) => !search || item.documentType.toLowerCase().includes(search.toLowerCase()) || String(item.id).includes(search));
  return <DataGrid title="" subtitle={`${filtered.length} document types`} data={filtered} columns={columns} searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search document types…" brandColor={brandColor ?? undefined} />;
}
