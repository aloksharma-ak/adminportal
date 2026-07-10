"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { DataGrid } from "@/components/controls/DataGrid";
import type { Student } from "@/app/dashboard/administration/actions";
import Link from "next/link";
import { Eye, GraduationCap, Pencil } from "lucide-react";
import { Avatar } from "@/components/shared-ui/Avatar";

const getColumns = (brandColor?: string): ColumnDef<Student>[] => [
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
          href={`/dashboard/administration/admission/${row.original.studentId}`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/dashboard/administration/admission/${row.original.studentId}/edit`}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {row.original.currentAdmissionId > 0 && (
          <Link
            href={`/dashboard/administration/admission/${row.original.studentId}/admissions`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            title="Open"
          >
            <GraduationCap className="h-4 w-4" />
          </Link>
        )}
      </div>
    ),
  },
  {
    accessorKey: "studentId",
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
    id: "student",
    header: "Student",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar
            src={s.profilePicture}
            firstName={s.firstName}
            lastName={s.lastName}
            initials={s.initials}
            size="sm"
            brandColor={brandColor}
          />
          <div>
            <Link
              href={`/dashboard/administration/admission/${s.studentId}`}
              className="font-semibold text-slate-900 hover:underline dark:text-slate-100"
            >
              {s.firstName} {s.lastName}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "fatherName",
    header: "Father's Name",
    cell: ({ getValue }) => getValue<string>() || "",
  },
  {
    accessorKey: "motherName",
    header: "Mother's Name",
    cell: ({ getValue }) => getValue<string>() || "",
  },
  {
    accessorKey: "enrolledClass",
    header: "Class",
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = row.original as any;
      const val = s.enrolledClass;
      if (!val) return s.classText ?? s.className ?? s.class ?? "";
      if (typeof val === "string") return val;
      return val.classText ?? val.className ?? "";
    },
  },
  {
    accessorKey: "currentAdmissionStatus",
    header: "Admission Status",
    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className={
          getValue<string>()
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30"
            : "border-gray-300 bg-gray-50 text-gray-500"
        }
      >
        {getValue<string>() || ""}
      </Badge>
    ),
  },
];

export default function StudentsGrid({
  data,
  brandColor,
  classOptions,
  initialClassId,
  initialSearch = "",
  errorMessage,
}: {
  data: Student[];
  brandColor?: string | null;
  classOptions?: { label: string; value: string }[];
  initialClassId?: string;
  initialSearch?: string;
  errorMessage?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(initialSearch);
  const [classId, setClassId] = React.useState<string | undefined>(
    initialClassId,
  );

  const columns = React.useMemo(
    () => getColumns(brandColor ?? undefined),
    [brandColor],
  );

  React.useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  React.useEffect(() => {
    setClassId(initialClassId);
  }, [initialClassId]);

  const updateFilters = React.useCallback(
    (nextSearch: string, nextClassId?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedSearch = nextSearch.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      } else {
        params.delete("search");
      }

      if (nextClassId) {
        params.set("classId", nextClassId);
      } else {
        params.delete("classId");
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const topFilters = React.useMemo(
    () => [
      {
        key: "classId",
        label: "Class",
        options: classOptions ?? [],
        value: classId,
        onChange: (value: string | undefined) => {
          setClassId(value);
        },
      },
    ],
    [classId, classOptions],
  );

  return (
    <DataGrid
      title=""
      subtitle={`${data.length} students`}
      data={data}
      columns={columns}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name"
      topFilters={topFilters}
      errorMessage={errorMessage}
      onToolbarSearch={({ searchValue, filters }) => {
        const nextClassId = filters.classId;
        setSearch(searchValue);
        setClassId(nextClassId);
        updateFilters(searchValue, nextClassId);
      }}
      onExport={(rows) => {
        const headers = ["ID", "First Name", "Last Name", "Class", "Status"];
        const csvRows = rows.map((s) => [
          s.studentId,
          s.firstName,
          s.lastName,
          s.enrolledClass ?? "",
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
          download: "students.csv",
        }).click();
        URL.revokeObjectURL(url);
      }}
      defaultPageSize={10}
      brandColor={brandColor ?? undefined}
    />
  );
}
