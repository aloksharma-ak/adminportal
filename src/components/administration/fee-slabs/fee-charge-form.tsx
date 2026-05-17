"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { InputField } from "@/components/controls/InputField";
import {
  DropdownFilter,
  type DropdownOption,
} from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  modifyFeeCharge,
  type FeeCharge,
} from "@/app/dashboard/administration/actions";

type FormValues = {
  grade: string;
  frequencyId: string;
  amount: number;
  isActive: boolean;
};

type Props = {
  orgId: number;
  brandColor?: string;
  feeChargeId?: number;
  defaultValues?: FeeCharge;
  frequencyOptions: { id: number; value: string }[];
  gradeOptions: { id: number; value: string }[];
};

export default function FeeChargeForm({
  orgId,
  brandColor,
  feeChargeId = 0,
  defaultValues,
  frequencyOptions,
  gradeOptions,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = feeChargeId > 0;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      grade: defaultValues?.grade ?? "",
      frequencyId: defaultValues?.frequencyId
        ? String(defaultValues.frequencyId)
        : "",
      amount: defaultValues?.amount ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { control, handleSubmit } = form;

  const dropdownFrequencyOptions: DropdownOption[] = frequencyOptions.map((f) => ({
    value: String(f.id),
    label: f.value,
  }));

  const onSubmit = handleSubmit(async (v) => {
    setLoading(true);
    const tId = toast.loading(
      isEditing ? "Updating fee charge..." : "Adding fee charge...",
    );
    try {
      const payload: Partial<FeeCharge> = {
        feeChargeId: isEditing ? feeChargeId : 0,
        orgId,
        grade: v.grade,
        frequencyId: v.frequencyId ? Number(v.frequencyId) : null,
        amount: Number(v.amount),
        isActive: v.isActive,
      };

      const res = await modifyFeeCharge(payload, session?.user?.profileId ?? 0);
      if (!res?.status) throw new Error(res?.message || "Failed");

      toast.success(
        res?.message || (isEditing ? "Charge updated!" : "Charge added!"),
        { id: tId },
      );
      router.push("/dashboard/administration/fee-slabs/fee-charges");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong", {
        id: tId,
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200/70 dark:border-slate-700/70">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Fee Charge" : "Add Fee Charge"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="grade"
              rules={{ required: "Grade is required" }}
              render={({ field }) => (
                <DropdownFilter
                  label="Grade"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Grade"
                  options={gradeOptions}
                />
              )}
            />
            <Controller
              control={control}
              name="frequencyId"
              render={({ field }) => (
                <DropdownFilter
                  label="Frequency"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Frequency"
                  options={dropdownFrequencyOptions}
                  allowClear={true}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              control={control}
              name="amount"
              label="Amount"
              type="number"
              placeholder="0"
              rules={{
                required: "Amount is required",
                min: { value: 0, message: "Amount cannot be negative" },
              }}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center gap-3 pt-8">
                  <ToggleControl
                    label="Is Active"
                    checked={field.value}
                    onChange={field.onChange}
                    color={brandColor}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Active
                  </span>
                </div>
              )}
            />
          </div>

          <ActionButton
            type="submit"
            color={brandColor}
            loading={loading}
            disabled={loading}
            className="h-11 w-full rounded-2xl"
          >
            {isEditing ? "Save Changes" : "Add Fee Charge"}
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}
