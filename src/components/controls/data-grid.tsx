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

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  title = "Work Order List",
  subtitle = "No Filters Applied",
  data,
  columns,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search text...",
  topFilters = [],
  actionsRight = [],
  onExport,
  onAdvancedSearch,
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

  const selectedCount = table.getSelectedRowModel().rows.length;

  const clearAll = () => {
    setSorting([]);
    setColumnFilters([]);
    setRowSelection({});
    onSearchChange?.("");
    topFilters.forEach((f) => f.onChange?.(undefined));
  };

  const exportRows = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    onExport?.(rows);
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
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
          {/* Left cluster: search + filters */}
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-sm">
              <Input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {topFilters.map((f) => (
                <Select
                  key={f.key}
                  value={f.value ?? ""}
                  onValueChange={(v) => f.onChange?.(v === "" ? undefined : v)}
                >
                  <SelectTrigger className="w-42">
                    <SelectValue placeholder={f.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {f.options.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
              <Button
                onClick={() => {
                  /* typically trigger fetch */
                }}
                style={{ backgroundColor: brandColor }}
              >
                Search
              </Button>
              {/* {onAdvancedSearch && (
                <Button variant="ghost" onClick={onAdvancedSearch}>
                  Advanced Search
                </Button>
              )} */}
            </div>
          </div>

          {/* Right cluster: Save/Export/Columns */}
          <div className="flex items-center gap-2">
            {actionsRight.map((a) => (
              <Button
                key={a.label}
                variant={a.variant ?? "outline"}
                onClick={a.onClick}
                disabled={a.disabled}
              >
                {a.label}
              </Button>
            ))}

            {/* {onExport && (
              <Button variant="outline" onClick={exportRows}>
                Export
              </Button>
            )} */}

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Column Setting</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((c) => c.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(v) => column.toggleVisibility(!!v)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>

        <Separator />

        {/* Selection info row (optional) */}
        <div className="flex items-center justify-end px-3 py-2">
          {/* <div className="text-sm text-muted-foreground">
            {enableRowSelection ? (
              <span>
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {selectedCount}
                </span>
              </span>
            ) : (
              <span> </span>
            )}
          </div> */}

          <div className="flex items-center gap-2">
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
        </div>

        {/* Table */}
        <div className="w-full overflow-auto">
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-3">
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
  );
}
