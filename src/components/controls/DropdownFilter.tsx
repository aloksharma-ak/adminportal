"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DropdownOption = { label: string; value: string };

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  options: DropdownOption[];
  className?: string;
  allowClear?: boolean;
}

export function DropdownFilter({
  value,
  onChange,
  placeholder = "Select...",
  options,
  className,
  allowClear = true,
}: Props) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange(v === "" ? undefined : v)}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && <SelectItem value="">All</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
