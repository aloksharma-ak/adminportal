"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { DataGridToolbar } from "./DataGridToolbar";

type TopFilterOption = { label: string; value: string };

export type GridTopFilter = {
  key: string; // e.g. "month" | "type" | "contractor"
  label: string; // visible label placeholder
  options: TopFilterOption[];
  value?: string;
  onChange?: (value: string | undefined) => void;
};

export type GridAction = {
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  onClick?: () => void;
  disabled?: boolean;
};

type Props<TData, TValue> = {
  title?: string;
  subtitle?: string;

  data: TData[];
  columns: ColumnDef<TData, TValue>[];

  // search (global)
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // top filters (dropdowns)
  topFilters?: GridTopFilter[];

  // committed toolbar search/filter values
  onToolbarSearch?: (values: {
    searchValue: string;
    filters: Record<string, string | undefined>;
  }) => void;

  // actions (right side)
  actionsRight?: GridAction[];
  onExport?: (rows: TData[]) => void;

  // advanced (optional button)
  onAdvancedSearch?: () => void;

  // table behavior
  pageSizeOptions?: number[];
  defaultPageSize?: number;

  // selection
  enableRowSelection?: boolean;

  // className
  className?: string;
  brandColor?: string;
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function DataGrid<TData, TValue>({
  title,
  data,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search text...",
  topFilters = [],
  onToolbarSearch,
  actionsRight = [],
  pageSizeOptions = [10, 20, 30, 50],
  defaultPageSize = 10,
  enableRowSelection = false,
  className,
  brandColor,
}: Props<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;

    const selectCol: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [selectCol, ...columns] as ColumnDef<TData, TValue>[];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: defaultPageSize },
    },
  });

  const clearAll = () => {
    setSorting([]);
    setColumnFilters([]);
    setRowSelection({});
    onSearchChange?.("");
    topFilters.forEach((f) => f.onChange?.(undefined));
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header row like screenshot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Separator orientation="vertical" className="h-5" />
        </div>
      </div>

      <div className="mt-4 rounded-lg border bg-background">
        <DataGridToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          topFilters={topFilters}
          actionsRight={actionsRight}
          brandColor={brandColor}
          onClear={clearAll}
          onSearch={onToolbarSearch}
        />

        <Separator />

        {/* Table */}
        <div className="w-full overflow-auto pt-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <div className="w-full flex justify-between items-center p-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-22">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={`${s}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
