"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { Search, Loader2, User, Coins, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { InputField } from "@/components/controls/InputField";
import { ActionButton } from "@/components/controls/Buttons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import {
  getStudentListWithFeeDetails,
  type StudentWithFeeDetail,
  type ClassMaster,
} from "@/app/dashboard/administration/actions";
import { getErrorMessage } from "@/app/dashboard/utils";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type SearchFormValues = {
  studentName: string;
  fatherName: string;
  classId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classMasters: ClassMaster[];
  orgId: number;
  userId?: number;
  brandColor?: string | null;
};

export default function AddFeeShortcutDialog({
  open,
  onOpenChange,
  classMasters = [],
  orgId,
  userId,
  brandColor,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<StudentWithFeeDetail[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      studentName: "",
      fatherName: "",
      classId: "",
    },
  });

  const { control, handleSubmit, reset } = form;

  const classOptions = React.useMemo(() => {
    return classMasters.map((c) => ({
      value: String(c.id),
      label: c.classText,
    }));
  }, [classMasters]);

  const handleSearch = handleSubmit(async (v) => {
    setLoading(true);
    setHasSearched(true);
    try {
      // Query with empty filters to prevent backend crashes (space crash, 0 matches crash, classId crash)
      const response = await getStudentListWithFeeDetails({
        payload: {
          orgId,
          studentName: "",
          classId: 0,
          fName: "",
        },
        userId,
      });

      if (response?.status) {
        let list = response.data || [];

        // Filter by Student Name client-side (firstName + lastName)
        if (v.studentName && v.studentName.trim() !== "") {
          const sQuery = v.studentName.toLowerCase().trim();
          list = list.filter((s) => {
            const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
            return fullName.includes(sQuery);
          });
        }

        // Filter by Father Name client-side
        if (v.fatherName && v.fatherName.trim() !== "") {
          const fQuery = v.fatherName.toLowerCase().trim();
          list = list.filter((s) =>
            (s.fatherName || "").toLowerCase().includes(fQuery)
          );
        }

        // Filter by Class client-side
        if (v.classId) {
          list = list.filter((s) => s.enrolledClassId === Number(v.classId));
        }

        setStudents(list);
      } else {
        setStudents([]);
        toast.error(response?.message || "Failed to fetch student details.");
      }
    } catch (err) {
      setStudents([]);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  });

  const handleClear = () => {
    reset({
      studentName: "",
      fatherName: "",
      classId: "",
    });
    setStudents([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[85vh] flex flex-col p-6 rounded-2xl overflow-hidden border-slate-200/80 dark:border-slate-800/80 shadow-2xl bg-white dark:bg-slate-900">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Coins className="h-5 w-5" style={{ color: brandColor ?? "#4f46e5" }} />
            Add Fee Shortcut
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Quickly lookup a student by name, class, or father&apos;s name to manage their admissions and fees.
          </DialogDescription>
        </DialogHeader>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 flex-none" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <InputField
              control={control}
              name="studentName"
              label="Student Name"
              placeholder="Enter student name..."
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
              className="h-10 rounded-lg"
            />

            <InputField
              control={control}
              name="fatherName"
              label="Father Name"
              placeholder="Enter father's name..."
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
              className="h-10 rounded-lg"
            />

            <Controller
              control={control}
              name="classId"
              render={({ field }) => (
                <DropdownFilter
                  label="Enrolled Class"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Class..."
                  options={classOptions}
                  className="h-10 rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  allowClear={true}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <ActionButton
              type="button"
              variant="outline"
              color="slate"
              onClick={handleClear}
              disabled={loading}
              className="h-9 px-4 rounded-lg"
            >
              Clear
            </ActionButton>
            <ActionButton
              type="submit"
              color={brandColor ?? "blue"}
              loading={loading}
              disabled={loading}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-9 px-5 rounded-lg font-medium shadow-xs"
            >
              Search Student
            </ActionButton>
          </div>
        </form>

        {/* Results Section */}
        <div className="flex-1 mt-6 overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: brandColor ?? "#4f46e5" }} />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                Fetching student records...
              </p>
            </div>
          ) : hasSearched && students.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
              <p className="font-semibold text-slate-800 dark:text-slate-200">No students found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Try adjusting your search filters or check for spelling errors.
              </p>
            </div>
          ) : students.length > 0 ? (
            <div className="flex-1 overflow-auto border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50/75 dark:bg-slate-800/50 sticky top-0 z-10">
                  <TableRow className="border-b border-slate-100 dark:border-slate-800">
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 pl-4">Student Info</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3">Father Name</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3">Class</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3">Status</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-right">Estimate Fee</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-right">Total Fee</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-right">Paid Fee</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-right">Discount</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-right">Pending Fee</TableHead>
                    <TableHead className="font-semibold text-xs tracking-wider text-slate-500 uppercase py-3 text-center pr-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const statusClass =
                      student.currentAdmissionStatus?.toLowerCase() === "enrolled"
                        ? "border-emerald-300 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-slate-300 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400";
                    return (
                      <TableRow
                        key={student.studentId}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all border-b border-slate-100 dark:border-slate-800"
                      >
                        <TableCell className="py-3.5 pl-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {student.firstName} {student.lastName}
                            </span>
                            {student.academicYear && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                AY: {student.academicYear}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 text-slate-600 dark:text-slate-300 text-sm">
                          {student.fatherName || "—"}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="outline" className="rounded-md font-medium border-slate-200 dark:border-slate-800 bg-slate-50/30 text-slate-700 dark:text-slate-300 text-xs">
                            {student.enrolledClass || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="outline" className={`rounded-md font-semibold text-xs ${statusClass}`}>
                            {student.currentAdmissionStatus || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300 text-sm">
                          {currency.format(student.totalEstimateFee ?? 0)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-medium text-slate-700 dark:text-slate-300 text-sm">
                          {currency.format(student.totalFeeAmount ?? 0)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                          {currency.format(student.totalPaidFeeAmount ?? 0)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-medium text-purple-600 dark:text-purple-400 text-sm">
                          {currency.format(student.totalDiscountAmount ?? 0)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right font-semibold text-amber-600 dark:text-amber-400 text-sm">
                          {currency.format(student.totalPendingFeeAmount ?? 0)}
                        </TableCell>
                        <TableCell className="py-3.5 text-center pr-4">
                          {student.currentAdmissionId === 0 ? (
                            <Link
                              href={`/dashboard/administration/admission/${student.studentId}/admissions/add-admission`}
                              onClick={() => onOpenChange(false)}
                            >
                              <ActionButton
                                size="sm"
                                variant="outline"
                                color={brandColor ?? "blue"}
                                leftIcon={<PlusCircle className="h-3.5 w-3.5" />}
                                className="h-8 rounded-lg text-xs font-semibold"
                              >
                                Add Admission
                              </ActionButton>
                            </Link>
                          ) : (
                            <Link
                              href={`/dashboard/administration/admission/${student.studentId}/admissions/${student.currentAdmissionId}/fee-structure/add`}
                              onClick={() => onOpenChange(false)}
                            >
                              <ActionButton
                                size="sm"
                                color={brandColor ?? "blue"}
                                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                                className="h-8 rounded-lg text-xs font-semibold"
                              >
                                Add Fee
                              </ActionButton>
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
              <Search className="h-8 w-8 stroke-1 mb-2" />
              <p className="text-sm font-medium">Use the filters above to search student fee records.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
