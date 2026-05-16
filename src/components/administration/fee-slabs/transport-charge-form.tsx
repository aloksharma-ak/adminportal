"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";
import { ActionButton } from "@/components/controls/Buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { modifyTransportCharge, type TransportCharge } from "@/app/dashboard/administration/fee-slabs/action";
import { FREQUENCY_MASTER } from "@/app/dashboard/administration/fee-slabs/constants";

type FormValues = {
  fromKM: number;
  toKM: number;
  frequencyId: string;
  amount: number;
  isActive: boolean;
};

type Props = {
  orgId: number;
  brandColor?: string;
  id?: number;
  defaultValues?: TransportCharge;
};

export default function TransportChargeForm({ orgId, brandColor, id = 0, defaultValues }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const isEditing = id > 0;
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      fromKM: defaultValues?.fromKM ?? 0,
      toKM: defaultValues?.toKM ?? 0,
      frequencyId: defaultValues?.frequencyId ? String(defaultValues.frequencyId) : "",
      amount: defaultValues?.amount ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  const { control, handleSubmit } = form;

  const frequencyOptions: DropdownOption[] = FREQUENCY_MASTER.map((f) => ({
    value: String(f.id),
    label: f.name,
  }));

  const onSubmit = handleSubmit(async (v) => {
    setLoading(true);
    const tId = toast.loading(isEditing ? "Updating transport charge..." : "Adding transport charge...");
    try {
      const payload: Partial<TransportCharge> = {
        id: isEditing ? id : 0,
        orgId,
        fromKM: Number(v.fromKM),
        toKM: Number(v.toKM),
        frequencyId: Number(v.frequencyId),
        amount: Number(v.amount),
        isActive: v.isActive,
      };

      const res = await modifyTransportCharge(payload, session?.user?.profileId ?? 0);
      if (!res?.status) throw new Error(res?.message || "Failed");
      
      toast.success(res?.message || (isEditing ? "Charge updated!" : "Charge added!"), { id: tId });
      router.push("/dashboard/administration/fee-slabs/transport-charges");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong", { id: tId });
    } finally {
      setLoading(false);
    }
  });

  return (
    <Card className="rounded-3xl border-slate-200/70 dark:border-slate-700/70">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Transport Charge" : "Add Transport Charge"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              control={control}
              name="fromKM"
              label="From (KM)"
              type="number"
              placeholder="0"
              rules={{ 
                required: "From KM is required",
                min: { value: 0, message: "Value cannot be negative" }
              }}
            />
            <InputField
              control={control}
              name="toKM"
              label="To (KM)"
              type="number"
              placeholder="0"
              rules={{ 
                required: "To KM is required",
                min: { value: 0, message: "Value cannot be negative" }
              }}
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
              rules={{ required: "Frequency is required" }}
              render={({ field }) => (
                <DropdownFilter
                  label="Frequency"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Frequency"
                  options={frequencyOptions}
                />
              )}
            />
          </div>

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

          <ActionButton
            type="submit"
            color={brandColor}
            loading={loading}
            disabled={loading}
            className="h-11 w-full rounded-2xl"
          >
            {isEditing ? "Save Changes" : "Add Transport Charge"}
          </ActionButton>
        </form>
      </CardContent>
    </Card>
  );
}
