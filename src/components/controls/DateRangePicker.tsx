"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: Props) {
  const label =
    value?.from && value?.to
      ? `${format(value.from, "dd MMM yyyy")} - ${format(value.to, "dd MMM yyyy")}`
      : value?.from
        ? `${format(value.from, "dd MMM yyyy")} - ...`
        : "Pick date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={className ?? "w-65 justify-start gap-2"}
        >
          <CalendarIcon className="h-4 w-4 opacity-70" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange(undefined)}
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
