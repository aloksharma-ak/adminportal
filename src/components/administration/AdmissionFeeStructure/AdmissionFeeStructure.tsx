"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { ClipboardPlus, Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  getApplicableCharges,
  getStudentFeeDetails,
  saveStudentFee,
  type StudentFee,
  type StudentFeeLineItem,
} from "@/app/dashboard/administration/actions";
import { getErrorMessage } from "@/app/dashboard/utils";
import { ActionButton, LinkButton } from "@/components/controls/Buttons";
import { DataGrid } from "@/components/controls/DataGrid";
import { DropdownFilter } from "@/components/controls/DropdownFilter";
import { InputField } from "@/components/controls/InputField";
import { PageHeader } from "@/components/shared-ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

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

type FeeFormValues = Omit<StudentFee, "feeLineItems"> & {
  feeLineItems: StudentFeeLineItem[];
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const paymentModeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
];

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const emptyLineItem = (): StudentFeeLineItem => ({
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
});

function makeDefaultFee(params: {
  orgId: number;
  studentId: number;
  admissionId: number;
  includeTransport?: boolean;
  distanceFromSchool?: number;
  defaultFrequencyId?: number;
  defaultDiscountPercentage?: number;
  feeLineItems?: StudentFeeLineItem[];
}): FeeFormValues {
  const totalAmount =
    params.feeLineItems?.reduce(
      (sum, item) => sum + toNumber(item.finalAmount),
      0,
    ) ?? 0;

  return {
    id: 0,
    orgId: params.orgId,
    admissionId: params.admissionId,
    studentId: params.studentId,
    isTransportInclude: params.includeTransport ?? false,
    distanceFromSchool: params.distanceFromSchool ?? 0,
    defaultFrequencyId: params.defaultFrequencyId ?? 0,
    defaultDiscountPercentage: params.defaultDiscountPercentage ?? 0,
    receiptNo: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    totalAmount,
    discountAmount: 0,
    paidAmount: 0,
    pendingAmount: totalAmount,
    paymentMode: "",
    remarks: "",
    isActive: true,
    feeLineItems:
      params.feeLineItems && params.feeLineItems.length > 0
        ? params.feeLineItems
        : [emptyLineItem()],
  };
}

function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function toInputDate(value: string | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.includes("T") ? value.slice(0, 10) : value;
}

function mapApplicableLineItem(
  item: Partial<StudentFeeLineItem> & Record<string, unknown>,
): StudentFeeLineItem {
  const finalAmount = toNumber(item.finalAmount ?? item.baseAmount);
  const paidAmount = toNumber(item.paidAmount);

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
    baseAmount: toNumber(item.baseAmount),
    transportAmount: toNumber(item.transportAmount),
    finalAmount,
    paidAmount,
    pendingAmount: Math.max(finalAmount - paidAmount, 0),
    isActive: true,
  };
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <Input value={String(value)} disabled />
    </div>
  );
}

function ChargeSearch({
  value,
  orgId,
  grade,
  includeTransport,
  distanceFromSchool,
  userId,
  onSelect,
}: {
  value: string;
  orgId: number;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool: number;
  userId?: number;
  onSelect: (item: StudentFeeLineItem) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState(value ?? "");
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<StudentFeeLineItem[]>([]);

  React.useEffect(() => {
    setSearchText(value ?? "");
  }, [value]);

  React.useEffect(() => {
    if (!open || !grade.trim()) return;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await getApplicableCharges({
          payload: {
            orgId,
            grade,
            includeTransport,
            distanceFromSchool,
            searchText,
            count: 10,
          },
          userId,
        });
        setOptions(
          rows.map((item) =>
            mapApplicableLineItem(
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
  }, [
    distanceFromSchool,
    grade,
    includeTransport,
    open,
    orgId,
    searchText,
    userId,
  ]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Charge Name</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full justify-start overflow-hidden text-ellipsis font-normal"
          >
            {value || "Search charge..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              value={searchText}
              onValueChange={setSearchText}
              placeholder="Search charge..."
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading charges..." : "No charges found."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={`${item.chargeId}-${item.chargeName}-${item.frequencyId}`}
                    value={`${item.chargeId}-${item.chargeName}`}
                    onSelect={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {item.chargeName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.chargeType || "Charge"} -{" "}
                        {currency.format(item.finalAmount)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function normalizeFee(fee: FeeFormValues): StudentFee {
  const rawLineItems = fee.feeLineItems.map((item) => {
    const finalAmount =
      toNumber(item.baseAmount) + toNumber(item.transportAmount);
    const linePaid = toNumber(item.paidAmount);

    return {
      ...item,
      id: toNumber(item.id),
      headerId: toNumber(item.headerId),
      chargeId: toNumber(item.chargeId),
      frequencyId: toNumber(item.frequencyId),
      transportSlabId: toNumber(item.transportSlabId),
      monthsInterval: toNumber(item.monthsInterval),
      fromMonth: toNumber(item.fromMonth),
      toMonth: toNumber(item.fromMonth) + toNumber(item.monthsInterval),
      baseAmount: toNumber(item.baseAmount),
      transportAmount: toNumber(item.transportAmount),
      finalAmount: roundAmount(finalAmount),
      paidAmount: roundAmount(linePaid),
      pendingAmount: 0,
      isActive: true,
    };
  });
  const totalAmount = roundAmount(
    rawLineItems.reduce((sum, item) => sum + item.finalAmount, 0),
  );
  const discountAmount = roundAmount(
    (totalAmount * toNumber(fee.defaultDiscountPercentage)) / 100,
  );
  const paidAmount = roundAmount(
    rawLineItems.reduce((sum, item) => sum + item.paidAmount, 0),
  );
  const netPayableAmount = roundAmount(
    Math.max(totalAmount - discountAmount, 0),
  );
  const pendingAmount = roundAmount(Math.max(netPayableAmount - paidAmount, 0));
  let remainingDiscount = discountAmount;
  const lineItems = rawLineItems.map((item, index) => {
    const lineBaseDue = Math.max(item.finalAmount - item.paidAmount, 0);
    const discountShare =
      index === rawLineItems.length - 1
        ? remainingDiscount
        : roundAmount(
            totalAmount > 0
              ? (discountAmount * item.finalAmount) / totalAmount
              : 0,
          );
    remainingDiscount = roundAmount(remainingDiscount - discountShare);

    return {
      ...item,
      pendingAmount: roundAmount(Math.max(lineBaseDue - discountShare, 0)),
    };
  });

  return {
    ...fee,
    id: toNumber(fee.id),
    orgId: toNumber(fee.orgId),
    admissionId: toNumber(fee.admissionId),
    studentId: toNumber(fee.studentId),
    distanceFromSchool: toNumber(fee.distanceFromSchool),
    defaultFrequencyId: toNumber(fee.defaultFrequencyId),
    defaultDiscountPercentage: toNumber(fee.defaultDiscountPercentage),
    receiptNo: "",
    totalAmount,
    discountAmount,
    paidAmount,
    pendingAmount,
    isActive: true,
    transactionDate: fee.transactionDate
      ? new Date(fee.transactionDate).toISOString()
      : new Date().toISOString(),
    feeLineItems: lineItems,
  };
}

function FeeDialog({
  open,
  onOpenChange,
  fee,
  brandColor,
  defaults,
  orgId,
  grade,
  includeTransport,
  distanceFromSchool,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee?: StudentFee | null;
  brandColor?: string | null;
  defaults: FeeFormValues;
  orgId: number;
  grade: string;
  includeTransport: boolean;
  distanceFromSchool: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const isEditing = Boolean(fee?.id);

  const form = useForm<FeeFormValues>({
    defaultValues: defaults,
  });

  const { control, handleSubmit, reset, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "feeLineItems",
    keyName: "fieldId",
  });
  const watchedLineItems = watch("feeLineItems");
  const watchedDiscount = watch("discountAmount");
  const watchedPaid = watch("paidAmount");
  const watchedDefaultDiscount = watch("defaultDiscountPercentage");

  React.useEffect(() => {
    reset(
      fee
        ? {
            ...fee,
            receiptNo: "",
            isActive: true,
            transactionDate: toInputDate(fee.transactionDate),
            feeLineItems:
              fee.feeLineItems?.length > 0
                ? fee.feeLineItems.map((item) => ({
                    ...item,
                    isActive: true,
                  }))
                : [emptyLineItem()],
          }
        : defaults,
    );
  }, [defaults, fee, reset]);

  React.useEffect(() => {
    const lineItems = watchedLineItems ?? [];
    const totalFinalAmount = roundAmount(
      lineItems.reduce(
        (sum, item) =>
          sum + toNumber(item.baseAmount) + toNumber(item.transportAmount),
        0,
      ),
    );
    const discountAmount = roundAmount(
      (totalFinalAmount * toNumber(watchedDefaultDiscount)) / 100,
    );
    let remainingDiscount = discountAmount;

    lineItems.forEach((item, index) => {
      const monthsInterval = toNumber(item.monthsInterval);
      const fromMonth = toNumber(item.fromMonth);
      const baseAmount = toNumber(item.baseAmount);
      const transportAmount = toNumber(item.transportAmount);
      const finalAmount = roundAmount(baseAmount + transportAmount);
      const itemPaid = toNumber(item.paidAmount);
      const discountShare =
        index === lineItems.length - 1
          ? remainingDiscount
          : roundAmount(
              totalFinalAmount > 0
                ? (discountAmount * finalAmount) / totalFinalAmount
                : 0,
            );
      remainingDiscount = roundAmount(remainingDiscount - discountShare);

      setValue(`feeLineItems.${index}.toMonth`, fromMonth + monthsInterval, {
        shouldDirty: false,
        shouldValidate: true,
      });
      setValue(`feeLineItems.${index}.finalAmount`, finalAmount, {
        shouldDirty: false,
        shouldValidate: true,
      });
      setValue(
        `feeLineItems.${index}.pendingAmount`,
        roundAmount(Math.max(finalAmount - itemPaid - discountShare, 0)),
        {
          shouldDirty: false,
          shouldValidate: true,
        },
      );
    });

    const paidAmount = roundAmount(
      lineItems.reduce((sum, item) => sum + toNumber(item.paidAmount), 0),
    );
    const netPayableAmount = roundAmount(
      Math.max(totalFinalAmount - discountAmount, 0),
    );
    const pending = roundAmount(Math.max(netPayableAmount - paidAmount, 0));

    setValue("discountAmount", discountAmount, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("paidAmount", paidAmount, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("totalAmount", totalFinalAmount, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("pendingAmount", pending, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [
    setValue,
    watchedDefaultDiscount,
    watchedDiscount,
    watchedLineItems,
    watchedPaid,
  ]);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    const tId = toast.loading(isEditing ? "Updating fee..." : "Adding fee...");
    try {
      const res = await saveStudentFee({
        payload: normalizeFee(values),
        userId: session?.user?.profileId,
      });

      if (!res?.status) throw new Error(res?.message || "Failed to save fee");

      toast.success(res.message || "Fee saved successfully", { id: tId });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err), { id: tId });
    } finally {
      setLoading(false);
    }
  });

  const totalFinalAmount =
    watchedLineItems?.reduce(
      (sum, item) =>
        sum + toNumber(item.baseAmount) + toNumber(item.transportAmount),
      0,
    ) ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Fee" : "Add Fee"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Receipt ${fee?.receiptNo || `#${fee?.id}`}`
              : "Create a fee record for this admission."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <ReadonlyField label="Org ID" value={defaults.orgId} />
            <ReadonlyField label="Admission ID" value={defaults.admissionId} />
            <ReadonlyField label="Student ID" value={defaults.studentId} />
            <ReadonlyField
              label="Transport Include"
              value={defaults.isTransportInclude ? "Yes" : "No"}
            />
            <InputField
              control={control}
              name="distanceFromSchool"
              label="Distance From School"
              type="number"
              disabled
            />
            <InputField
              control={control}
              name="defaultFrequencyId"
              label="Default Frequency ID"
              type="number"
              disabled
            />
            <InputField
              control={control}
              name="defaultDiscountPercentage"
              label="Default Discount %"
              type="number"
              disabled
            />
            <InputField
              control={control}
              name="receiptNo"
              label="Receipt No"
              disabled
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              control={control}
              name="transactionDate"
              label="Transaction Date"
              type="date"
            />
            <Controller
              control={control}
              name="paymentMode"
              render={({ field }) => (
                <DropdownFilter
                  label="Payment Mode"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? "")}
                  placeholder="Select payment mode"
                  options={paymentModeOptions}
                  allowClear={false}
                />
              )}
            />
            <InputField control={control} name="remarks" label="Remarks" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Fee Line Items
              </h3>
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-2"
                onClick={() => append(emptyLineItem())}
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.fieldId}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Item {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.id`}
                    label="ID"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.headerId`}
                    label="Header ID"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.chargeId`}
                    label="Charge ID"
                    type="number"
                    disabled
                  />
                  <Controller
                    control={control}
                    name={`feeLineItems.${index}.chargeName`}
                    render={({ field }) => (
                      <ChargeSearch
                        value={field.value ?? ""}
                        orgId={orgId}
                        grade={grade}
                        includeTransport={includeTransport}
                        distanceFromSchool={distanceFromSchool}
                        userId={session?.user?.profileId}
                        onSelect={(item) => {
                          setValue(`feeLineItems.${index}.id`, item.id);
                          setValue(
                            `feeLineItems.${index}.headerId`,
                            item.headerId,
                          );
                          setValue(
                            `feeLineItems.${index}.chargeId`,
                            item.chargeId,
                          );
                          setValue(
                            `feeLineItems.${index}.chargeName`,
                            item.chargeName,
                          );
                          setValue(
                            `feeLineItems.${index}.chargeType`,
                            item.chargeType,
                          );
                          setValue(
                            `feeLineItems.${index}.frequencyId`,
                            item.frequencyId,
                          );
                          setValue(
                            `feeLineItems.${index}.transportSlabId`,
                            item.transportSlabId,
                          );
                          setValue(
                            `feeLineItems.${index}.monthsInterval`,
                            item.monthsInterval,
                          );
                          setValue(
                            `feeLineItems.${index}.baseAmount`,
                            item.baseAmount,
                          );
                          setValue(
                            `feeLineItems.${index}.transportAmount`,
                            item.transportAmount,
                          );
                          setValue(`feeLineItems.${index}.isActive`, true);
                        }}
                      />
                    )}
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.chargeType`}
                    label="Charge Type"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.frequencyId`}
                    label="Frequency ID"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.transportSlabId`}
                    label="Transport Slab ID"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.monthsInterval`}
                    label="Months Interval"
                    type="number"
                    disabled
                  />
                  <Controller
                    control={control}
                    name={`feeLineItems.${index}.fromMonth`}
                    render={({ field }) => (
                      <DropdownFilter
                        label="From Month"
                        value={String(field.value || "")}
                        onChange={(value) => field.onChange(Number(value) || 0)}
                        placeholder="Select month"
                        options={monthOptions}
                        allowClear={false}
                      />
                    )}
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.toMonth`}
                    label="To Month"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.baseAmount`}
                    label="Base Amount"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.transportAmount`}
                    label="Transport Amount"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.finalAmount`}
                    label="Final Amount"
                    type="number"
                    disabled
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.paidAmount`}
                    label="Paid Amount"
                    type="number"
                  />
                  <InputField
                    control={control}
                    name={`feeLineItems.${index}.pendingAmount`}
                    label="Pending Amount"
                    type="number"
                    disabled
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Fee Summary
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ReadonlyField
                label="Total Final Amount"
                value={currency.format(totalFinalAmount)}
              />
              <InputField
                control={control}
                name="discountAmount"
                label="Discount Amount"
                type="number"
                disabled
              />
              <InputField
                control={control}
                name="paidAmount"
                label="Paid Amount"
                type="number"
                disabled
              />
              <InputField
                control={control}
                name="pendingAmount"
                label="Pending Amount"
                type="number"
                disabled
              />
              <InputField
                control={control}
                name="totalAmount"
                label="Total Amount"
                type="number"
                disabled
              />
              <ReadonlyField label="Active" value="true" />
            </div>
          </div>

          <ActionButton
            type="submit"
            color={brandColor ?? "blue"}
            loading={loading}
            disabled={loading}
            className="h-11 w-full"
          >
            {isEditing ? "Save Changes" : "Add Fee"}
          </ActionButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getColumns(
  onEdit: (fee: StudentFee) => void,
  loadingAction: boolean,
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEdit(row.original)}
          disabled={loadingAction}
          title="Edit fee"
        >
          <Pencil className="h-4 w-4" />
        </Button>
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
  orgId,
  studentId,
  admissionId,
  brandColor,
  title,
  description,
  backLabel = "Back to Admission",
  grade,
  includeTransport,
  distanceFromSchool = 0,
  defaultFrequencyId = 0,
  defaultDiscountPercentage = 0,
}: Props) {
  const { data: session } = useSession();
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [selectedFee, setSelectedFee] = React.useState<StudentFee | null>(null);
  const [loadingAction, setLoadingAction] = React.useState(false);

  const defaults = React.useMemo(
    () =>
      makeDefaultFee({
        orgId,
        studentId,
        admissionId,
        includeTransport,
        distanceFromSchool,
        defaultFrequencyId,
        defaultDiscountPercentage,
      }),
    [
      admissionId,
      defaultDiscountPercentage,
      defaultFrequencyId,
      distanceFromSchool,
      includeTransport,
      orgId,
      studentId,
    ],
  );

  const openEditFee = React.useCallback(
    async (fee: StudentFee) => {
      setLoadingAction(true);
      const tId = toast.loading("Loading fee details...");
      try {
        const details = await getStudentFeeDetails({
          headerId: fee.id,
          orgId,
          userId: session?.user?.profileId,
        });

        setSelectedFee(details ?? fee);
        setOpen(true);
        toast.success("Fee details loaded", { id: tId });
      } catch (err) {
        setSelectedFee(fee);
        setOpen(true);
        toast.error(getErrorMessage(err), { id: tId });
      } finally {
        setLoadingAction(false);
      }
    },
    [orgId, session?.user?.profileId],
  );

  const columns = React.useMemo(
    () => getColumns(openEditFee, loadingAction),
    [loadingAction, openEditFee],
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

      <FeeDialog
        open={open}
        onOpenChange={setOpen}
        fee={selectedFee}
        defaults={defaults}
        brandColor={brandColor}
        orgId={orgId}
        grade={grade}
        includeTransport={includeTransport}
        distanceFromSchool={distanceFromSchool}
      />
    </>
  );
}
