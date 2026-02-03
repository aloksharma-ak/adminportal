"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

export type MultiSelectOption = { label: string; value: string };

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  maxBadges?: number;
}

export function MultiSelectFilter({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className,
  maxBadges = 2,
}: Props) {
  const selected = React.useMemo(() => new Set(value), [value]);

  const toggle = (val: string) => {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(Array.from(next));
  };

  const selectedLabels = options
    .filter((o) => selected.has(o.value))
    .map((o) => o.label);

  const shown = selectedLabels.slice(0, maxBadges);
  const hiddenCount = Math.max(0, selectedLabels.length - shown.length);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className={className ?? "w-65 justify-between"}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-left">
              {selectedLabels.length ? "" : placeholder}
            </span>

            {!!selectedLabels.length && (
              <div className="flex flex-wrap gap-1">
                {shown.map((l) => (
                  <Badge key={l} variant="secondary">
                    {l}
                  </Badge>
                ))}
                {hiddenCount > 0 && (
                  <Badge variant="secondary">+{hiddenCount}</Badge>
                )}
              </div>
            )}
          </div>

          <ChevronsUpDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup>
            {options.map((o) => {
              const isSelected = selected.has(o.value);
              return (
                <CommandItem
                  key={o.value}
                  onSelect={() => toggle(o.value)}
                  className="flex items-center justify-between"
                >
                  <span>{o.label}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>

        <div className="flex items-center justify-between border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            disabled={!value.length}
          >
            Clear
          </Button>
          <span className="text-xs text-muted-foreground">
            {value.length} selected
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
