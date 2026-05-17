"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getErrorMessage } from "@/app/dashboard/utils";
import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { modifyAdmissionCharge, type AdmissionCharge } from "@/app/dashboard/administration/actions";

type FormValues = {
  chargeName: string;
  chargeType: string;
  isRecurring: boolean;
  frequencyId: string;
  amount: number;
  isActive: boolean;
};

type Props = {
  orgId: number;
  brandColor?: string;
  chargeId?: number;
  defaultValues?: AdmissionCharge;
  frequencyOptions: { id: number; value: string }[];
};

export default function AdmissionChargeForm({ orgId, brandColor, chargeId = 0, defaultValues, frequencyOptions }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = chargeId > 0;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      chargeName: defaultValues?.chargeName ?? "",
      chargeType: defaultValues?.chargeType ?? "",
      isRecurring: defaultValues?.isRecurring ?? false,
      frequencyId: defaultValues?.frequencyId ? String(defaultValues.frequencyId) : "",
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
    const tId = toast.loading(isEditing ? "Updating charge..." : "Adding charge...");
    try {
      const payload: Partial<AdmissionCharge> = {
        chargeId: isEditing ? chargeId : 0,
        orgId,
        chargeName: v.chargeName.trim(),
        chargeType: v.chargeType.trim(),
        isRecurring: v.isRecurring,
        frequencyId: v.frequencyId ? Number(v.frequencyId) : null,
        amount: Number(v.amount),
        isActive: v.isActive,
      };

      const res = await modifyAdmissionCharge(payload, session?.user?.profileId ?? 0);
      if (!res?.status) throw new Error(res?.message || "Failed");
      
      toast.success(res?.message || (isEditing ? "Charge updated!" : "Charge added!"), { id: tId });
      if (isEditing) {
        router.push(`/dashboard/administration/fee-slabs/admission-charges/${chargeId}`);
      } else {
        router.push("/dashboard/administration/fee-slabs/admission-charges");
      }
      router.refresh();
    } catch (e) {
      toast.error(getErrorMessage(e), { id: tId });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200/70 dark:border-slate-700/70">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Admission Charge" : "Add Admission Charge"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              control={control}
              name="chargeName"
              label="Charge Name"
              placeholder="e.g. Admission Fee"
              rules={{ required: "Charge name is required" }}
            />
            <InputField
              control={control}
              name="chargeType"
              label="Charge Type"
              placeholder="e.g. One Time"
              rules={{ required: "Charge type is required" }}
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
                min: { value: 0, message: "Amount cannot be negative" }
              }}
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

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Controller
              control={control}
              name="isRecurring"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <ToggleControl
                    label="Is Recurring"
                    checked={field.value}
                    onChange={field.onChange}
                    color={brandColor}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring Charge</span>
                </div>
              )}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <ToggleControl
                    label="Is Active"
                    checked={field.value}
                    onChange={field.onChange}
                    color={brandColor}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
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
            {isEditing ? "Save Changes" : "Add Charge"}
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}
