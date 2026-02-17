"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type DropdownOption = { label: string; value: string };

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  options: DropdownOption[];
  className?: string;
  allowClear?: boolean;

  // ✅ FieldLabel props
  label?: string;
  id?: string;
  required?: boolean;
  labelClassName?: string;
  wrapperClassName?: string;
}

const CLEAR_VALUE = "__CLEAR__";

export function DropdownFilter({
  value,
  onChange,
  placeholder = "Select...",
  options,
  className,
  allowClear = true,
  label,
  id,
  required = false,
  labelClassName,
  wrapperClassName,
}: Props) {
  const autoId = React.useId();
  const triggerId = id ?? `dropdown-${autoId}`;

  return (
    <div className={cn("space-y-3", wrapperClassName)}>
      {label ? (
        <Label
          htmlFor={triggerId}
          className={cn("text-sm font-medium", labelClassName)}
        >
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </Label>
      ) : null}

      <Select
        value={value}
        onValueChange={(v) => onChange(v === CLEAR_VALUE ? undefined : v)}
      >
        <SelectTrigger id={triggerId} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {allowClear && <SelectItem value={CLEAR_VALUE}>All</SelectItem>}

          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
