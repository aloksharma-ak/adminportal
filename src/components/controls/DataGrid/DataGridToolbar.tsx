"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { GridAction, GridTopFilter } from "./DataGrid";

const ALL_FILTER_VALUE = "__all__";

type DataGridToolbarClassNames = {
  root?: string;
  leftCluster?: string;
  searchWrapper?: string;
  filtersWrapper?: string;
  rightCluster?: string;
};

export type DataGridToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  topFilters?: GridTopFilter[];
  actionsRight?: GridAction[];
  brandColor?: string;
  clearLabel?: string;
  searchLabel?: string;
  showClear?: boolean;
  showSearch?: boolean;
  className?: string;
  classNames?: DataGridToolbarClassNames;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onClear?: () => void;
  onSearch?: (values: {
    searchValue: string;
    filters: Record<string, string | undefined>;
  }) => void;
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DataGridToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search text...",
  topFilters = [],
  actionsRight = [],
  brandColor,
  clearLabel = "Clear",
  searchLabel = "Search",
  showClear = true,
  showSearch = true,
  className,
  classNames,
  leftContent,
  rightContent,
  onClear,
  onSearch,
}: DataGridToolbarProps) {
  const [draftSearch, setDraftSearch] = React.useState(searchValue ?? "");
  const [draftFilters, setDraftFilters] = React.useState<
    Record<string, string | undefined>
  >({});
  const filterValueSignature = JSON.stringify(
    topFilters.map((filter) => [filter.key, filter.value ?? null]),
  );

  React.useEffect(() => {
    setDraftSearch(searchValue ?? "");
  }, [searchValue]);

  React.useEffect(() => {
    const filterValues = JSON.parse(filterValueSignature) as [
      string,
      string | null,
    ][];

    setDraftFilters(
      filterValues.reduce<Record<string, string | undefined>>((acc, filter) => {
        const [key, value] = filter;
        acc[key] = value ?? undefined;
        return acc;
      }, {}),
    );
  }, [filterValueSignature]);

  const commitSearch = (updatedFilters?: Record<string, string | undefined>) => {
    const filtersToUse = updatedFilters ?? draftFilters;
    onSearchChange?.(draftSearch);
    topFilters.forEach((filter) => {
      filter.onChange?.(filtersToUse[filter.key]);
    });
    onSearch?.({ searchValue: draftSearch, filters: filtersToUse });
  };

  const clearToolbar = () => {
    const emptyFilters = topFilters.reduce<Record<string, undefined>>(
      (acc, filter) => {
        acc[filter.key] = undefined;
        return acc;
      },
      {},
    );

    setDraftSearch("");
    setDraftFilters(emptyFilters);
    onClear?.();
    onSearch?.({ searchValue: "", filters: emptyFilters });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between",
        className,
        classNames?.root,
      )}
    >
      <div
        className={cn(
          "flex flex-1 flex-col gap-2 md:flex-row md:items-center",
          classNames?.leftCluster,
        )}
      >
        {leftContent}

        <div
          className={cn("relative w-full md:max-w-sm", classNames?.searchWrapper)}
        >
          <Input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitSearch();
              }
            }}
            placeholder={searchPlaceholder}
          />
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            classNames?.filtersWrapper,
          )}
        >
          {topFilters.map((filter) => (
            <Select
              key={filter.key}
              value={draftFilters[filter.key] ?? ALL_FILTER_VALUE}
              onValueChange={(value) =>
                setDraftFilters((current) => ({
                  ...current,
                  [filter.key]:
                    value === ALL_FILTER_VALUE ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-42">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {showClear && (
            <Button variant="outline" onClick={clearToolbar}>
              {clearLabel}
            </Button>
          )}
          {showSearch && (
            <Button onClick={() => commitSearch()} style={{ backgroundColor: brandColor }}>
              {searchLabel}
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn("flex items-center gap-2", classNames?.rightCluster)}
      >
        {actionsRight.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? "outline"}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
        {rightContent}
      </div>
    </div>
  );
}
