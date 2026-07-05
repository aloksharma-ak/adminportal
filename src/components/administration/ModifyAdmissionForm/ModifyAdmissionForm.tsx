"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  Calculator,
  Calendar,
  GraduationCap,
  IndianRupee,
  Percent,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getErrorMessage } from "@/app/dashboard/utils";

import { InputField } from "@/components/controls/InputField";
import {
  DropdownFilter,
  type DropdownOption,
} from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import type {
  AdmissionStatusMaster,
  ClassMaster,
  FrequencyMaster,
  StudentAdmission,
} from "@/app/dashboard/administration/actions";
import {
  calculateEstimateFee,
  modifyAdmission,
} from "@/app/dashboard/administration/actions";

type FormValues = {
  academicYear: string;
  classId: string;
  statusId: string;
  defaultFrequencyId: string;
  defaultDiscountPrecentage: number;
  estimateFeeAmount: number;
  isIncludeTransport: boolean;
  distanceFromSchool: number;
  isActive: boolean;
};

type Props = {
  orgId: number;
  studentId: number;
  admission?: Partial<StudentAdmission>;
  classMasters: ClassMaster[];
  admissionStatusMasters: AdmissionStatusMaster[];
  frequencyMasters: FrequencyMaster[];
  brandColor?: string;
  mode?: "create" | "edit";
};

export default function ModifyAdmissionForm({
  orgId,
  studentId,
  admission = {},
  classMasters = [],
  admissionStatusMasters = [],
  frequencyMasters = [],
  brandColor,
  mode = "edit",
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [calculatingFee, setCalculatingFee] = React.useState(false);
  const isCreateMode = mode === "create";

  // Map backend classes to Dropdown options
  const classDropdownOptions: DropdownOption[] = React.useMemo(
    () =>
      classMasters.map((c) => ({
        value: String(c.id),
        label: c.classText,
      })),
    [classMasters],
  );

  // Map backend statuses to Dropdown options
  const statusDropdownOptions: DropdownOption[] = React.useMemo(
    () =>
      admissionStatusMasters.map((s) => ({
        value: String(s.id),
        label: s.status,
      })),
    [admissionStatusMasters],
  );

  const frequencyDropdownOptions: DropdownOption[] = React.useMemo(
    () =>
      frequencyMasters.map((f) => ({
        value: String(f.id),
        label: f.name,
      })),
    [frequencyMasters],
  );

  // Auto-resolve initial classId and statusId from their text representations
  const resolvedClassId = React.useMemo(() => {
    const matched = classMasters.find(
      (c) =>
        c.classText?.toLowerCase() === admission.class?.toLowerCase() ||
        `${c.grade}-${c.section}`.toLowerCase() ===
          admission.class?.toLowerCase(),
    );
    return matched ? String(matched.id) : "";
  }, [classMasters, admission.class]);

  const resolvedStatusId = React.useMemo(() => {
    const matched = admissionStatusMasters.find(
      (s) => s.status?.toLowerCase() === admission.status?.toLowerCase(),
    );
    return matched ? String(matched.id) : "";
  }, [admissionStatusMasters, admission.status]);

  const resolvedFrequencyId = React.useMemo(() => {
    if (admission.defaultFrequencyId) return String(admission.defaultFrequencyId);
    const df = admission.defaultFrequency;
    if (df == null) return "";

    const dfStr = String(df).toLowerCase();
    const matched = frequencyMasters.find(
      (f) =>
        f.name?.toLowerCase() === dfStr ||
        String(f.id) === String(df),
    );
    return matched ? String(matched.id) : "";
  }, [frequencyMasters, admission.defaultFrequency, admission.defaultFrequencyId]);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      academicYear: admission.academicYear ?? "",
      classId: resolvedClassId,
      statusId: resolvedStatusId,
      defaultFrequencyId: resolvedFrequencyId,
      defaultDiscountPrecentage: admission.defaultDiscountPrecentage ?? 0,
      estimateFeeAmount: admission.estimateFeeAmount ?? 0,
      isIncludeTransport: admission.isIncludeTransport ?? false,
      distanceFromSchool: admission.distanceFromSchool ?? admission.defaultDistance ?? 0,
      isActive: admission.isActive ?? true,
    },
  });

  const { control, getValues, handleSubmit, setValue, watch } = form;
  const isIncludeTransport = watch("isIncludeTransport");

  const handleCalculateEstimateFee = async () => {
    const values = getValues();
    const classIdNum = Number(values.classId);
    const frequencyIdNum = Number(values.defaultFrequencyId);
    const discountPercentage = Number(values.defaultDiscountPrecentage) || 0;

    if (!values.classId || !Number.isFinite(classIdNum) || classIdNum <= 0) {
      toast.error("Class selection is required");
      return;
    }
    if (
      !values.defaultFrequencyId ||
      !Number.isFinite(frequencyIdNum) ||
      frequencyIdNum <= 0
    ) {
      toast.error("Default Frequency is required");
      return;
    }
    if (discountPercentage < 0 || discountPercentage > 100) {
      toast.error("Discount must be between 0 and 100");
      return;
    }

    setCalculatingFee(true);
    const tId = toast.loading("Calculating estimate fee...");
    try {
      const res = await calculateEstimateFee({
        payload: {
          frequencyId: frequencyIdNum,
          defaultDiscountPercentage: discountPercentage,
          orgId,
          classId: classIdNum,
        },
        userId: session?.user?.profileId ?? 0,
      });

      if (!res?.status) {
        throw new Error(res?.message || "Failed to calculate estimate fee");
      }

      const totalFee = Number(res.data?.totalFee) || 0;
      setValue("estimateFeeAmount", totalFee, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success(res?.message || "Estimate fee calculated", { id: tId });
    } catch (e) {
      toast.error(getErrorMessage(e), { id: tId });
    } finally {
      setCalculatingFee(false);
    }
  };

  const onSubmit = handleSubmit(async (v) => {
    const classIdNum = Number(v.classId);
    const statusIdNum = Number(v.statusId);
    const defaultFrequencyIdNum = Number(v.defaultFrequencyId);

    if (!v.academicYear.trim()) {
      return toast.error("Academic Year is required");
    }
    if (!v.classId) {
      return toast.error("Class selection is required");
    }
    if (!v.statusId) {
      return toast.error("Admission Status is required");
    }
    if (!v.defaultFrequencyId) {
      return toast.error("Default Frequency is required");
    }

    setLoading(true);
    const tId = toast.loading(
      isCreateMode
        ? "Adding admission record..."
        : "Updating admission records...",
    );
    try {
      const payload = {
        admissionId: admission.admissionId ?? 0,
        orgId,
        studentId,
        academicYear: v.academicYear.trim(),
        classId: classIdNum,
        statusId: statusIdNum,
        defaultFrequencyId: defaultFrequencyIdNum,
        defaultDiscountPrecentage: Number(v.defaultDiscountPrecentage) || 0,
        estimateFeeAmount: Number(v.estimateFeeAmount) || 0,
        isIncludeTransport: v.isIncludeTransport,
        distanceFromSchool: Number(v.distanceFromSchool) || 0,
        isActive: v.isActive,
      };

      const res = await modifyAdmission({
        payload,
        userId: session?.user?.profileId ?? 0,
      });

      if (!res?.status) {
        throw new Error(
          res?.message ||
            (isCreateMode
              ? "Failed to add admission details"
              : "Failed to modify admission details"),
        );
      }

      toast.success(
        res?.message ||
          (isCreateMode
            ? "Admission record added successfully!"
            : "Admission records updated successfully!"),
        { id: tId },
      );
      router.push(
        `/dashboard/administration/admission/${studentId}/admissions`,
      );
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e), { id: tId });
    } finally {
      setLoading(false);
    }
  });

  return (
    <section className="space-y-6">
      <Card className="rounded-3xl border-slate-200/70 dark:border-slate-700/70 shadow-sm bg-white dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <GraduationCap
              className="h-6 w-6"
              style={{ color: brandColor ?? "#3b82f6" }}
            />
            {isCreateMode ? "Add Admission Record" : "Modify Admission Record"}
          </CardTitle>
          <CardDescription>
            {isCreateMode
              ? "Create a new academic enrollment record for this student"
              : `Update enrollment details for admission reference #${admission.admissionId}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8" noValidate>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Academic Year */}
              <InputField
                control={control}
                name="academicYear"
                label="Academic Year"
                placeholder="e.g. 2026-27"
                className="h-11 rounded-2xl"
                leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
                rules={{ required: "Academic Year is required" }}
              />

              {/* Class Master Dropdown */}
              <Controller
                control={control}
                name="classId"
                rules={{ required: "Class is required" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <DropdownFilter
                      label="Enrolled Class"
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      placeholder="Select Enrolled Class"
                      options={classDropdownOptions}
                      className="h-11 rounded-2xl"
                      allowClear={false}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-red-600 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Status Master Dropdown */}
              <Controller
                control={control}
                name="statusId"
                rules={{ required: "Admission Status is required" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <DropdownFilter
                      label="Admission Status"
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      placeholder="Select Admission Status"
                      options={statusDropdownOptions}
                      className="h-11 rounded-2xl"
                      allowClear={false}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-red-600 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="defaultFrequencyId"
                rules={{ required: "Default Frequency is required" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <DropdownFilter
                      label="Default Frequency"
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      placeholder="Select Default Frequency"
                      options={frequencyDropdownOptions}
                      className="h-11 rounded-2xl"
                      allowClear={false}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-red-600 font-medium">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <InputField
                control={control}
                name="defaultDiscountPrecentage"
                label="Default Discount Percentage"
                type="number"
                placeholder="e.g. 10"
                className="h-11 rounded-2xl"
                leftIcon={<Percent className="h-4 w-4 text-slate-400" />}
                rules={{
                  validate: (v) => {
                    const value = Number(v);
                    return (
                      (value >= 0 && value <= 100) ||
                      "Discount must be between 0 and 100"
                    );
                  },
                }}
              />

              <div className="space-y-2 flex items-end gap-4">
                <InputField
                  control={control}
                  name="estimateFeeAmount"
                  label="Estimate Fee Amount"
                  type="number"
                  placeholder="Click calculate"
                  className="h-11 rounded-2xl"
                  disabled
                  leftIcon={<IndianRupee className="h-4 w-4 text-slate-400" />}
                  rules={{
                    validate: (v) =>
                      Number(v) >= 0 || "Estimate fee cannot be negative",
                  }}
                />
                <ActionButton
                  type="button"
                  variant="outline"
                  color={brandColor ?? "blue"}
                  loading={calculatingFee}
                  disabled={loading || calculatingFee}
                  onClick={handleCalculateEstimateFee}
                  leftIcon={<Calculator className="h-4 w-4" />}
                  className="h-11 mb-2 rounded-2xl font-semibold"
                >
                  Calculate Estimate Fee
                </ActionButton>
              </div>

              {/* Distance from School */}
              {isIncludeTransport && (
                <InputField
                  control={control}
                  name="distanceFromSchool"
                  label="Distance From School (in Kms)"
                  type="number"
                  placeholder="e.g. 5.5"
                  className="h-11 rounded-2xl"
                  leftIcon={<Truck className="h-4 w-4 text-slate-400" />}
                  rules={{
                    validate: (v) =>
                      Number(v) >= 0 || "Distance cannot be a negative value",
                  }}
                />
              )}
            </div>

            <Separator />

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/30">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Include Transport Service
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enable if the student requires organization transport
                  </p>
                </div>
                <ToggleControl
                  color={brandColor}
                  label=""
                  checked={isIncludeTransport}
                  onChange={(v) => setValue("isIncludeTransport", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/30">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Active Status
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Marks this admission reference record as active or inactive
                  </p>
                </div>
                <ToggleControl
                  color={brandColor}
                  label=""
                  checked={watch("isActive")}
                  onChange={(v) => setValue("isActive", v)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <ActionButton
                type="submit"
                color={brandColor}
                loading={loading}
                disabled={loading}
                className="h-11 flex-1 rounded-2xl font-bold"
              >
                {loading
                  ? isCreateMode
                    ? "Adding Admission..."
                    : "Saving Changes..."
                  : isCreateMode
                    ? "Add Admission"
                    : "Save Changes"}
              </ActionButton>
              <ActionButton
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-11 px-6 rounded-2xl font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </ActionButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
