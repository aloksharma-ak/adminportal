"use client";

import * as React from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck, Pencil, Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createClass,
  type AcademicClass,
} from "@/app/dashboard/academics/actions";
import { getErrorMessage } from "@/app/dashboard/utils";
import { ActionButton } from "@/components/controls/Buttons";
import { DataGrid } from "@/components/controls/DataGrid";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { InputField } from "@/components/controls/InputField";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

type Option = { value: string; label: string };

type Props = {
  data: AcademicClass[];
  orgId: number;
  brandColor?: string | null;
  gradeOptions: Option[];
  teacherOptions: Option[];
};

type ClassFormValues = {
  grade: string;
  section: string;
  classTeacherId: string;
};

function ClassDialog({
  open,
  onOpenChange,
  selectedClass,
  orgId,
  brandColor,
  gradeOptions,
  teacherOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: AcademicClass | null;
  orgId: number;
  brandColor?: string | null;
  gradeOptions: Option[];
  teacherOptions: Option[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = React.useState(false);
  const isEditing = Boolean(selectedClass?.id);
  const { control, handleSubmit, reset } = useForm<ClassFormValues>({
    defaultValues: {
      grade: "",
      section: "",
      classTeacherId: "0",
    },
  });

  React.useEffect(() => {
    reset({
      grade: selectedClass?.grade ?? "",
      section: selectedClass?.section ?? "",
      classTeacherId: String(selectedClass?.classTeacherId ?? 0),
    });
  }, [reset, selectedClass]);

  const submit = handleSubmit(async (values) => {
    if (!values.grade.trim() || !values.section.trim()) {
      toast.error("Grade and section are required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      isEditing ? "Updating class..." : "Creating class...",
    );
    try {
      const response = await createClass({
        payload: {
          id: selectedClass?.id ?? 0,
          grade: values.grade.trim(),
          section: values.section.trim(),
          classTeacherId: Number(values.classTeacherId) || 0,
          orgId,
        },
        userId: session?.user?.profileId,
      });
      if (!response.status) {
        throw new Error(response.message || "Unable to save class.");
      }

      toast.success(response.message || "Class saved successfully.", {
        id: toastId,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setSaving(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Class" : "Create Class"}</DialogTitle>
          <DialogDescription>
            Configure the grade, section and assigned class teacher.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          {gradeOptions.length > 0 ? (
            <Controller
              control={control}
              name="grade"
              render={({ field }) => (
                <DropdownFilter
                  label="Grade"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? "")}
                  options={gradeOptions}
                  placeholder="Select grade"
                  allowClear={false}
                />
              )}
            />
          ) : (
            <InputField
              control={control}
              name="grade"
              label="Grade"
              placeholder="e.g. 5"
            />
          )}
          <InputField
            control={control}
            name="section"
            label="Section"
            placeholder="e.g. A"
          />
          {teacherOptions.length > 0 ? (
            <Controller
              control={control}
              name="classTeacherId"
              render={({ field }) => (
                <DropdownFilter
                  label="Class Teacher"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? "0")}
                  options={teacherOptions}
                  placeholder="Select teacher"
                />
              )}
            />
          ) : (
            <InputField
              control={control}
              name="classTeacherId"
              label="Class Teacher ID"
              type="number"
            />
          )}

          <ActionButton
            type="submit"
            color={brandColor ?? "blue"}
            loading={saving}
            disabled={saving}
            className="w-full"
          >
            {isEditing ? "Save Changes" : "Create Class"}
          </ActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function columns(
  onEdit: (value: AcademicClass) => void,
  brandColor?: string,
): ColumnDef<AcademicClass>[] {
  return [
    {
      id: "serial",
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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Edit class"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Link
            href={`/dashboard/academics/classes/${row.original.id}/attendance`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Attendance"
          >
            <CalendarCheck className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Class ID",
      cell: ({ getValue }) => (
        <Badge
          variant="outline"
          style={
            brandColor
              ? { color: brandColor, borderColor: brandColor }
              : undefined
          }
        >
          #{getValue<number>()}
        </Badge>
      ),
    },
    {
      id: "class",
      header: "Class",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.classText ||
            `${row.original.grade}-${row.original.section}`}
        </span>
      ),
    },
    { accessorKey: "grade", header: "Grade" },
    { accessorKey: "section", header: "Section" },
    {
      id: "teacher",
      header: "Class Teacher",
      cell: ({ row }) =>
        row.original.classTeacherName ||
        (row.original.classTeacherId
          ? `#${row.original.classTeacherId}`
          : "Not assigned"),
    },
    {
      accessorKey: "noOfStudents",
      header: "Students",
      cell: ({ getValue }) => getValue<number>() ?? 0,
    },
  ];
}

export default function ClassGrid({
  data,
  orgId,
  brandColor,
  gradeOptions,
  teacherOptions,
}: Props) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] =
    React.useState<AcademicClass | null>(null);

  const tableColumns = React.useMemo(
    () =>
      columns((value) => {
        setSelectedClass(value);
        setOpen(true);
      }, brandColor ?? undefined),
    [brandColor],
  );

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((item) =>
      [
        item.id,
        item.grade,
        item.section,
        item.classText,
        item.classTeacherName,
      ].some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [data, search]);

  return (
    <>
      <PageHeader
        title="Classes"
        description="Manage classes, sections and attendance"
        backLabel="Back to Dashboard"
        actions={
          <ActionButton
            type="button"
            color={brandColor ?? "blue"}
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setSelectedClass(null);
              setOpen(true);
            }}
          >
            Create Class
          </ActionButton>
        }
      />

      <DataGrid
        title=""
        subtitle={`${filtered.length} of ${data.length} classes`}
        data={filtered}
        columns={tableColumns}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search class, grade or teacher..."
        defaultPageSize={10}
        brandColor={brandColor ?? undefined}
      />

      <ClassDialog
        open={open}
        onOpenChange={setOpen}
        selectedClass={selectedClass}
        orgId={orgId}
        brandColor={brandColor}
        gradeOptions={gradeOptions}
        teacherOptions={teacherOptions}
      />
    </>
  );
}
