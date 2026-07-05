"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Plus, Save, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  getApplicableCharges,
  saveStudentFee,
  type StudentFee,
  type StudentFeeLineItem,
  type FrequencyMaster,
} from "@/app/dashboard/administration/actions";
import { getErrorMessage } from "@/app/dashboard/utils";
import { ActionButton } from "@/components/controls/Buttons";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { InputField } from "@/components/controls/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type Props = {
  orgId: number;
  studentId: number;
  admissionId: number;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool: number;
  defaultFrequencyId: number;
  defaultDiscountPercentage: number;
  initialCharges: StudentFeeLineItem[];
  brandColor?: string | null;
  frequencyMasters: FrequencyMaster[];
  paymentModeMasters: string[];
  fee?: StudentFee;
};

type FormValues = StudentFee & {
  additionalDiscount: number;
};

const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, index) => ({ value: String(index + 1), label }));

function getMonthName(monthNum: number) {
  if (!monthNum) return "-";
  const index = (monthNum - 1) % 12;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[index] ?? "-";
}

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function emptyLineItem(): StudentFeeLineItem {
  return {
    id: 0,
    headerId: 0,
    chargeId: 0,
    chargeName: "",
    chargeType: "",
    frequencyId: 0,
    transportSlabId: 0,
    monthsInterval: 0,
    fromMonth: 0,
    toMonth: 0,
    baseAmount: 0,
    transportAmount: 0,
    finalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    isActive: true,
  };
}

function normalizeCharge(
  item: Partial<StudentFeeLineItem> & Record<string, unknown>,
): StudentFeeLineItem {
  const baseAmount = toNumber(item.baseAmount);
  const transportAmount = toNumber(item.transportAmount);
  const finalAmount = roundAmount(baseAmount + transportAmount);

  return {
    id: toNumber(item.id),
    headerId: toNumber(item.headerId),
    chargeId: toNumber(item.chargeId),
    chargeName: String(item.chargeName ?? ""),
    chargeType: String(item.chargeType ?? ""),
    frequencyId: toNumber(item.frequencyId),
    transportSlabId: toNumber(item.transportSlabId),
    monthsInterval: toNumber(item.monthsInterval),
    fromMonth: toNumber(item.fromMonth),
    toMonth: toNumber(item.toMonth),
    baseAmount,
    transportAmount,
    finalAmount,
    paidAmount: 0,
    pendingAmount: finalAmount,
    isActive: true,
  };
}

function buildPayload(values: FormValues): StudentFee {
  const rawItems = values.feeLineItems.map((item) => {
    const finalAmount = roundAmount(
      toNumber(item.baseAmount) + toNumber(item.transportAmount),
    );

    return {
      ...item,
      id: 0,
      headerId: 0,
      chargeId: toNumber(item.chargeId),
      frequencyId: toNumber(item.frequencyId),
      transportSlabId: toNumber(item.transportSlabId),
      monthsInterval: toNumber(item.monthsInterval),
      fromMonth: toNumber(item.fromMonth),
      toMonth: toNumber(item.fromMonth) + toNumber(item.monthsInterval),
      baseAmount: toNumber(item.baseAmount),
      transportAmount: toNumber(item.transportAmount),
      finalAmount,
      paidAmount: 0,
      pendingAmount: finalAmount,
      isActive: true,
    };
  });

  const totalAmount = roundAmount(
    rawItems.reduce((sum, item) => sum + item.finalAmount, 0),
  );

  const defaultDiscountAmount = roundAmount(
    (totalAmount * toNumber(values.defaultDiscountPercentage)) / 100,
  );
  const additionalDiscount = toNumber(values.additionalDiscount);
  const discountAmount = roundAmount(
    defaultDiscountAmount + additionalDiscount,
  );

  const paidAmount = roundAmount(toNumber(values.paidAmount));
  const pendingAmount = roundAmount(
    Math.max(totalAmount - discountAmount - paidAmount, 0),
  );

  let remainingDiscount = discountAmount;
  let remainingPaid = paidAmount;

  const feeLineItems = rawItems.map((item, index) => {
    const discountShare =
      index === rawItems.length - 1
        ? remainingDiscount
        : roundAmount(
            totalAmount > 0
              ? (discountAmount * item.finalAmount) / totalAmount
              : 0,
          );
    remainingDiscount = roundAmount(remainingDiscount - discountShare);

    const netLineAmount = Math.max(item.finalAmount - discountShare, 0);

    const paidShare =
      index === rawItems.length - 1
        ? remainingPaid
        : roundAmount(
            totalAmount > 0 ? (paidAmount * item.finalAmount) / totalAmount : 0,
          );
    const actualPaidShare = Math.min(paidShare, netLineAmount);
    remainingPaid = roundAmount(remainingPaid - actualPaidShare);

    return {
      ...item,
      paidAmount: actualPaidShare,
      pendingAmount: roundAmount(Math.max(netLineAmount - actualPaidShare, 0)),
    };
  });

  const { additionalDiscount: _, ...rest } = values;

  return {
    ...rest,
    id: 0,
    receiptNo: "",
    transactionDate: new Date(values.transactionDate).toISOString(),
    totalAmount,
    discountAmount,
    paidAmount,
    pendingAmount,
    isActive: true,
    feeLineItems,
    finalAmount: totalAmount,
  };
}

function LockedField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} disabled />
    </div>
  );
}

function ChargePicker({
  value,
  orgId,
  grade,
  includeTransport,
  distanceFromSchool,
  userId,
  onSelect,
  frequencyMasters,
}: {
  value: string;
  orgId: number;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool: number;
  userId?: number;
  onSelect: (item: StudentFeeLineItem) => void;
  frequencyMasters: FrequencyMaster[];
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<StudentFeeLineItem[]>([]);

  React.useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const result = await getApplicableCharges({
          payload: {
            orgId,
            grade,
            includeTransport,
            distanceFromSchool,
            searchText: query,
            count: 10,
          },
          userId,
        });
        setOptions(
          result.map((item) =>
            normalizeCharge(
              item as Partial<StudentFeeLineItem> & Record<string, unknown>,
            ),
          ),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [distanceFromSchool, grade, includeTransport, open, orgId, query, userId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-56 justify-between font-normal"
        >
          <span className="max-w-44 truncate">{value || "Select charge"}</span>
          <Search className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search charges..."
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Loading charges..." : "No charges found."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((item) => {
                const freqName =
                  frequencyMasters.find((f) => f.id == item.frequencyId)
                    ?.name || "";
                return (
                  <CommandItem
                    key={`${item.chargeId}-${item.frequencyId}-${item.chargeName}`}
                    onSelect={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {item.chargeName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.chargeType || "Charge"} ·{" "}
                        {freqName ? `${freqName} · ` : ""}
                        {item.finalAmount}
                      </div>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function AddAdmissionFeeForm({
  orgId,
  studentId,
  admissionId,
  grade,
  includeTransport,
  distanceFromSchool,
  defaultFrequencyId,
  defaultDiscountPercentage,
  brandColor,
  frequencyMasters,
  paymentModeMasters,
  fee,
}: Props) {
  const paymentModeOptions = React.useMemo(() => {
    const modes =
      paymentModeMasters && paymentModeMasters.length > 0
        ? paymentModeMasters
        : ["Cheque", "Cash", "UPI", "Debit Card", "Credit Card"];
    return modes.map((mode) => ({
      value: mode,
      label: mode,
    }));
  }, [paymentModeMasters]);

  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = React.useState(false);
  const isEdit = Boolean(fee?.id);

  const initialAdditionalDiscount = React.useMemo(() => {
    if (!fee) return 0;
    const total = fee.totalAmount || 0;
    const defaultPct = fee.defaultDiscountPercentage || 0;
    const defaultAmt = roundAmount((total * defaultPct) / 100);
    return Math.max((fee.discountAmount || 0) - defaultAmt, 0);
  }, [fee]);

  const form = useForm<FormValues>({
    defaultValues: {
      id: fee?.id ?? 0,
      orgId: fee?.orgId ?? orgId,
      admissionId: fee?.admissionId ?? admissionId,
      studentId: fee?.studentId ?? studentId,
      isTransportInclude: fee?.isTransportInclude ?? includeTransport,
      distanceFromSchool: fee?.distanceFromSchool ?? distanceFromSchool,
      defaultFrequencyId: fee?.defaultFrequencyId ?? defaultFrequencyId,
      defaultDiscountPercentage:
        fee?.defaultDiscountPercentage ?? defaultDiscountPercentage,
      receiptNo: fee?.receiptNo ?? "",
      transactionDate: fee?.transactionDate
        ? new Date(fee.transactionDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      totalAmount: fee?.totalAmount ?? 0,
      discountAmount: fee?.discountAmount ?? 0,
      paidAmount: fee?.paidAmount ?? 0,
      pendingAmount: fee?.pendingAmount ?? 0,
      paymentMode: fee?.paymentMode ?? "",
      remarks: fee?.remarks ?? "",
      isActive: fee?.isActive ?? true,
      feeLineItems:
        fee?.feeLineItems && fee.feeLineItems.length > 0
          ? fee.feeLineItems
          : [],
      additionalDiscount: initialAdditionalDiscount,
    },
  });

  const { control, handleSubmit, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "feeLineItems",
    keyName: "fieldKey",
  });

  const watchedLineItems = watch("feeLineItems");
  const lineItems = React.useMemo(
    () => watchedLineItems ?? [],
    [watchedLineItems],
  );

  const totals = React.useMemo(() => {
    const totalFinalAmount = roundAmount(
      lineItems.reduce(
        (sum, item) =>
          sum + toNumber(item.baseAmount) + toNumber(item.transportAmount),
        0,
      ),
    );
    const discountAmount = roundAmount(
      (totalFinalAmount * defaultDiscountPercentage) / 100,
    );

    return {
      totalFinalAmount,
      discountAmount,
    };
  }, [
    defaultDiscountPercentage,
    lineItems.length,
    lineItems.map((item) => item.chargeId).join(","),
  ]);

  const watchedAdditionalDiscount = watch("additionalDiscount") ?? 0;
  const watchedPaidAmount = watch("paidAmount") ?? 0;
  const watchedReceiptNo = watch("receiptNo") ?? "";

  const finalAmount = totals.totalFinalAmount;
  const defaultDiscountAmount = totals.discountAmount;
  const additionalDiscount = toNumber(watchedAdditionalDiscount);
  const paidAmount = toNumber(watchedPaidAmount);

  const pendingAmount = roundAmount(
    Math.max(
      finalAmount - (defaultDiscountAmount + additionalDiscount + paidAmount),
      0,
    ),
  );

  const submit = handleSubmit(async (values) => {
    const selectedItems = values.feeLineItems.filter(
      (item) => item.chargeId > 0,
    );
    if (selectedItems.length === 0) {
      toast.error("At least one charge is required.");
      return;
    }
    if (!values.paymentMode) {
      toast.error("Payment mode is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(
      isEdit ? "Saving changes..." : "Adding fee...",
    );
    try {
      const response = await saveStudentFee({
        payload: buildPayload({ ...values, feeLineItems: selectedItems }),
        userId: session?.user?.profileId,
      });
      if (!response?.status) {
        throw new Error(
          response?.message ||
            (isEdit ? "Failed to save changes." : "Failed to add fee."),
        );
      }

      toast.success(
        response.message ||
          (isEdit ? "Changes saved successfully." : "Fee added successfully."),
        {
          id: toastId,
        },
      );
      router.push(
        `/dashboard/administration/admission/${studentId}/admissions/${admissionId}/fee-structure`,
      );
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Header</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <LockedField label="Org ID" value={orgId} />
          <LockedField label="Admission ID" value={admissionId} />
          <LockedField label="Student ID" value={studentId} />
          <LockedField
            label="Transport"
            value={includeTransport ? "Included" : "Not Included"}
          />
          <LockedField
            label="Distance From School"
            value={distanceFromSchool}
          />
          <LockedField
            label="Frequency"
            value={
              frequencyMasters.find((f) => f.id === defaultFrequencyId)?.name ||
              defaultFrequencyId ||
              "-"
            }
          />
          <LockedField label="Discount %" value={defaultDiscountPercentage} />
          <LockedField label="Receipt No" value={watchedReceiptNo || "-"} />

          <InputField
            control={control}
            name="transactionDate"
            label="Transaction Date"
            type="datetime-local"
          />
          <Controller
            control={control}
            name="paymentMode"
            render={({ field }) => (
              <DropdownFilter
                label="Payment Mode"
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                options={paymentModeOptions}
                placeholder="Select payment mode"
                allowClear={false}
              />
            )}
          />
          <InputField
            control={control}
            name="remarks"
            label="Remarks"
            fieldClassName="md:col-span-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Fee Line Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => append(emptyLineItem())}
          >
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Charge</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>From Month</TableHead>
                <TableHead>To Month</TableHead>
                <TableHead>Base</TableHead>
                <TableHead>Transport</TableHead>
                <TableHead>Final</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const item = lineItems[index] ?? field;
                return (
                  <TableRow key={field.fieldKey}>
                    <TableCell className="pl-6">
                      <ChargePicker
                        value={item.chargeName}
                        orgId={orgId}
                        grade={grade}
                        includeTransport={includeTransport}
                        distanceFromSchool={distanceFromSchool}
                        userId={session?.user?.profileId}
                        frequencyMasters={frequencyMasters}
                        onSelect={(charge) => {
                          setValue(`feeLineItems.${index}`, {
                            ...charge,
                            id: 0,
                            headerId: 0,
                            fromMonth: item.fromMonth || 0,
                            paidAmount: 0,
                            isActive: true,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.chargeType || "-"}</TableCell>
                    <TableCell>
                      {frequencyMasters.find((f) => f.id == item.frequencyId)
                        ?.name ||
                        item.frequencyId ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`feeLineItems.${index}.fromMonth`}
                        render={({ field: monthField }) => (
                          <DropdownFilter
                            value={String(monthField.value || "")}
                            onChange={(value) =>
                              monthField.onChange(Number(value) || 0)
                            }
                            options={monthOptions}
                            placeholder="Month"
                            allowClear={false}
                            className="w-36"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      {item.fromMonth
                        ? getMonthName(
                            toNumber(item.fromMonth) +
                              toNumber(item.monthsInterval),
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {toNumber(item.baseAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {toNumber(item.transportAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {roundAmount(
                        toNumber(item.baseAmount) +
                          toNumber(item.transportAmount),
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(index)}
                        title="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-5 md:grid-cols-5">
          <LockedField label="Final Amount" value={finalAmount.toFixed(2)} />
          <LockedField
            label="Default Discount Amount"
            value={defaultDiscountAmount.toFixed(2)}
          />
          <InputField
            control={control}
            name="additionalDiscount"
            label="Additional Discount"
            type="number"
            rules={{ min: { value: 0, message: "Cannot be negative" } }}
          />
          <InputField
            control={control}
            name="paidAmount"
            label="Paid Amount"
            type="number"
            rules={{ min: { value: 0, message: "Cannot be negative" } }}
          />
          <LockedField
            label="Pending Amount"
            value={pendingAmount.toFixed(2)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <ActionButton
          type="button"
          variant="outline"
          color="slate"
          onClick={() => router.back()}
        >
          Cancel
        </ActionButton>
        <ActionButton
          type="submit"
          color={brandColor ?? "blue"}
          leftIcon={<Save className="h-4 w-4" />}
          loading={saving}
          disabled={saving}
        >
          {isEdit ? "Save Changes" : "Add Fee"}
        </ActionButton>
      </div>
    </form>
  );
}
