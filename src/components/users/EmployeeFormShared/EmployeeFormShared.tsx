"use client";

import * as React from "react";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import Indian_states_cities_list from "indian-states-cities-list";
import { cn } from "@/lib/utils";
import { InputField } from "@/components/controls/InputField";
import { DropdownFilter, type DropdownOption } from "@/components/controls/DropdownFilter";
import { ToggleControl } from "@/components/controls/ToggleControl";

export const MAX_IMAGE_BYTES = 500 * 1024;

export type Address = {
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  city: string;
  state: string;
};

export type EmployeeFormValues = {
  orgId: number;
  empId: number;
  profileId: number;
  roleId: string | undefined;
  firstName: string;
  middleName: string;
  lastName: string;
  initials: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  panNo: string;
  aadharNo: string;
  passportNo: string;
  profilePicture: string;
  permanantAddress: Address;
  isCommunicationAddressSameAsPermanant: boolean;
  communicationAddress: Address;
  isCreateCredential: boolean;
  userName: string;
  password: string;
};

export const EMPTY_ADDRESS: Address = {
  addressLine1: "",
  addressLine2: "",
  pinCode: "",
  city: "",
  state: "",
};

export function addressesEqual(a: Address, b: Address) {
  return (
    a.addressLine1 === b.addressLine1 &&
    a.addressLine2 === b.addressLine2 &&
    a.pinCode === b.pinCode &&
    a.city === b.city &&
    a.state === b.state
  );
}

export function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {icon}
      </div>
      {children}
    </div>
  );
}

export function FormToggleRow({
  title,
  description,
  checked,
  onChange,
  color,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ToggleControl color={color ?? undefined} label="" checked={checked} onChange={onChange} />
    </div>
  );
}

export function AddressFields({
  prefix,
  control,
  setValue,
  selectedState,
  stateOptions,
  cityOptions,
}: {
  prefix: "permanantAddress" | "communicationAddress";
  control: Control<EmployeeFormValues>;
  setValue: UseFormSetValue<EmployeeFormValues>;
  selectedState: string;
  stateOptions: DropdownOption[];
  cityOptions: DropdownOption[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <InputField
        control={control}
        name={`${prefix}.addressLine1`}
        label="Address Line 1"
        placeholder="House no, street"
        className="h-11 rounded-2xl"
        rules={{ required: "Address Line 1 is required" }}
      />
      <InputField
        control={control}
        name={`${prefix}.addressLine2`}
        label="Address Line 2"
        placeholder="Optional"
        className="h-11 rounded-2xl"
      />
      <InputField
        control={control}
        name={`${prefix}.pinCode`}
        label="Pin Code"
        placeholder="e.g. 110001"
        className="h-11 rounded-2xl"
        rules={{ required: "Pin code is required" }}
      />
      <div className="flex gap-4">
        <Controller
          control={control}
          name={`${prefix}.state`}
          rules={{ required: "State is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter
                label="State"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setValue(`${prefix}.city`, ""); // reset city on state change
                }}
                placeholder="Select State"
                options={stateOptions}
                className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")}
                allowClear={false}
              />
              {fieldState.invalid && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name={`${prefix}.city`}
          rules={{ required: "City is required" }}
          render={({ field, fieldState }) => (
            <div className="flex-1 space-y-1.5">
              <DropdownFilter
                label="City"
                value={field.value}
                onChange={field.onChange}
                placeholder={selectedState ? "Select City" : "Select state first"}
                options={cityOptions}
                className={cn("h-11 py-5 rounded-2xl", fieldState.invalid && "border-red-500")}
                allowClear={false}
              />
              {fieldState.invalid && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}

export function useIndianStatesAndCities(permState?: string, commState?: string) {
  const stateOptions = React.useMemo<DropdownOption[]>(
    () =>
      (Indian_states_cities_list.STATES_OBJECT ?? []).map((s) => ({
        value: s.name,
        label: s.label,
      })),
    [],
  );

  const permCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!permState) return [];
    return (Indian_states_cities_list.STATE_WISE_CITIES?.[permState] ?? []).map((c) => ({
      value: c.value,
      label: c.label,
    }));
  }, [permState]);

  const commCityOptions = React.useMemo<DropdownOption[]>(() => {
    if (!commState) return [];
    return (Indian_states_cities_list.STATE_WISE_CITIES?.[commState] ?? []).map((c) => ({
      value: c.value,
      label: c.label,
    }));
  }, [commState]);

  return { stateOptions, permCityOptions, commCityOptions };
}
