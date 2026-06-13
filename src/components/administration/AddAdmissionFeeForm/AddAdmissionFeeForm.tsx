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
};

type FormValues = StudentFee;

const paymentModeOptions = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "Card", label: "Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Cheque", label: "Cheque" },
];

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
    const paidAmount = roundAmount(toNumber(item.paidAmount));

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
      paidAmount,
      pendingAmount: 0,
      isActive: true,
    };
  });

  const totalAmount = roundAmount(
    rawItems.reduce((sum, item) => sum + item.finalAmount, 0),
  );
  const discountAmount = roundAmount(
    (totalAmount * toNumber(values.defaultDiscountPercentage)) / 100,
  );
  const paidAmount = roundAmount(
    rawItems.reduce((sum, item) => sum + item.paidAmount, 0),
  );
  const pendingAmount = roundAmount(
    Math.max(totalAmount - discountAmount - paidAmount, 0),
  );

  let remainingDiscount = discountAmount;
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

    return {
      ...item,
      pendingAmount: roundAmount(
        Math.max(item.finalAmount - discountShare - item.paidAmount, 0),
      ),
    };
  });

  return {
    ...values,
    id: 0,
    receiptNo: "",
    transactionDate: new Date(values.transactionDate).toISOString(),
    totalAmount,
    discountAmount,
    paidAmount,
    pendingAmount,
    isActive: true,
    feeLineItems,
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
  }, [
    distanceFromSchool,
    grade,
    includeTransport,
    open,
    orgId,
    query,
    userId,
  ]);

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
              {options.map((item) => (
                <CommandItem
                  key={`${item.chargeId}-${item.frequencyId}-${item.chargeName}`}
                  onSelect={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{item.chargeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.chargeType || "Charge"} · {item.finalAmount}
                    </div>
                  </div>
                </CommandItem>
              ))}
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
  initialCharges,
  brandColor,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      id: 0,
      orgId,
      admissionId,
      studentId,
      isTransportInclude: includeTransport,
      distanceFromSchool,
      defaultFrequencyId,
      defaultDiscountPercentage,
      receiptNo: "",
      transactionDate: new Date().toISOString().slice(0, 16),
      totalAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paymentMode: "",
      remarks: "",
      isActive: true,
      feeLineItems:
        initialCharges.length > 0
          ? initialCharges.map((item) => normalizeCharge(item))
          : [emptyLineItem()],
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
    const paidAmount = roundAmount(
      lineItems.reduce((sum, item) => sum + toNumber(item.paidAmount), 0),
    );
    const pendingAmount = roundAmount(
      Math.max(totalFinalAmount - discountAmount - paidAmount, 0),
    );

    return {
      totalFinalAmount,
      discountAmount,
      paidAmount,
      pendingAmount,
    };
  }, [defaultDiscountPercentage, lineItems]);

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
    const toastId = toast.loading("Adding fee...");
    try {
      const response = await saveStudentFee({
        payload: buildPayload({ ...values, feeLineItems: selectedItems }),
        userId: session?.user?.profileId,
      });
      if (!response?.status) {
        throw new Error(response?.message || "Failed to add fee.");
      }

      toast.success(response.message || "Fee added successfully.", {
        id: toastId,
      });
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
          <LockedField label="Distance From School" value={distanceFromSchool} />
          <LockedField label="Frequency ID" value={defaultFrequencyId} />
          <LockedField
            label="Discount %"
            value={defaultDiscountPercentage}
          />
          <LockedField label="Receipt No" value="" />

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
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
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
                        onSelect={(charge) => {
                          setValue(`feeLineItems.${index}`, {
                            ...charge,
                            id: 0,
                            headerId: 0,
                            fromMonth: item.fromMonth || 0,
                            paidAmount: item.paidAmount || 0,
                            isActive: true,
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.chargeType || "-"}</TableCell>
                    <TableCell>{item.frequencyId || "-"}</TableCell>
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
                        ? toNumber(item.fromMonth) +
                          toNumber(item.monthsInterval)
                        : "-"}
                    </TableCell>
                    <TableCell>{toNumber(item.baseAmount).toFixed(2)}</TableCell>
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
                      <Controller
                        control={control}
                        name={`feeLineItems.${index}.paidAmount`}
                        render={({ field: paidField }) => (
                          <Input
                            {...paidField}
                            type="number"
                            min={0}
                            max={item.finalAmount}
                            className="w-28"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      {roundAmount(
                        Math.max(
                          toNumber(item.baseAmount) +
                            toNumber(item.transportAmount) -
                            toNumber(item.paidAmount),
                          0,
                        ),
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={fields.length === 1}
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
          <LockedField
            label="Final Amount"
            value={totals.totalFinalAmount.toFixed(2)}
          />
          <LockedField
            label="Discount"
            value={totals.discountAmount.toFixed(2)}
          />
          <LockedField label="Paid" value={totals.paidAmount.toFixed(2)} />
          <LockedField
            label="Pending"
            value={totals.pendingAmount.toFixed(2)}
          />
          <LockedField
            label="Total Amount"
            value={totals.totalFinalAmount.toFixed(2)}
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
          Add Fee
        </ActionButton>
      </div>
    </form>
  );
}
