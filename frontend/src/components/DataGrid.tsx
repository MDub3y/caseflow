/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CSVRow } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { StatusBadge } from "./grid-parts/StatusBadge"; // Imported

interface DataGridProps {
  rows: CSVRow[];
  onCellEdit?: (rowId: string, field: string, value: string) => void;
  onDeleteRow?: (index: number) => void;
  onSelectionChange?: (selectedIndices: number[]) => void;
  maxHeight?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  rows,
  onCellEdit,
  onDeleteRow,
  onSelectionChange,
  maxHeight = "600px",
}) => {
  const { user } = useAuthStore();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onSelectionChange) {
      const selectedIndices = Object.keys(rowSelection).map(Number);
      onSelectionChange(selectedIndices);
    }
  }, [rowSelection, onSelectionChange]);

  const columns = useMemo<ColumnDef<CSVRow>[]>(() => {
    if (rows.length === 0) return [];

    const firstRow = rows[0];
    const fields = Object.keys(firstRow.data);

    return [
      // Selection Column
      {
        id: "select",
        size: 40,
        header: ({ table }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-primary"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-primary"
            />
          </div>
        ),
      },
      // Row Number
      {
        accessorKey: "rowNumber",
        header: "#",
        size: 50,
        cell: ({ row }) => (
          <div className="text-muted-foreground font-mono text-xs text-center">
            {row.index + 1}
          </div>
        ),
      },
      // Dynamic Data Columns
      ...fields.map((field) => ({
        accessorKey: `data.${field}`,
        header: field.replace(/_/g, " ").toUpperCase(),
        size: 180,
        cell: ({ row }: { row: any }) => {
          const value = row.original.data[field];
          const error = row.original.errors[field];
          const isEditable = !!onCellEdit;

          return (
            <div className="relative w-full h-full group">
              {isEditable ? (
                <>
                  <Input
                    type="text"
                    value={value ?? ""}
                    onChange={(e) =>
                      onCellEdit(row.index.toString(), field, e.target.value)
                    }
                    className={cn(
                      "w-full h-9 px-2 py-1 text-sm border rounded-none focus:ring-1 focus:ring-primary transition-all",
                      "bg-transparent text-foreground placeholder:text-muted-foreground",
                      error
                        ? "border-destructive bg-destructive/10 pr-8 focus:border-destructive"
                        : "border-transparent hover:border-border focus:border-primary"
                    )}
                  />
                  {error && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 group/error">
                      <AlertCircle className="h-4 w-4 text-destructive cursor-help" />

                      <div className="absolute bottom-full right-0 mb-2 w-max max-w-[200px] hidden group-hover/error:block animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative px-3 py-2 bg-destructive text-destructive-foreground text-xs rounded-md shadow-lg border border-destructive/50">
                          <span className="font-medium">{error}</span>
                          <div className="absolute top-full right-1.5 -mt-1 border-4 border-transparent border-t-destructive" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "px-2 py-2 text-sm truncate text-foreground",
                    error && "text-destructive"
                  )}
                >
                  {value}
                </div>
              )}
            </div>
          );
        },
      })),
      // Status Column (Used extracted component)
      {
        id: "status",
        header: "Status",
        size: 100,
        cell: ({ row }) => (
          <StatusBadge status={row.original.isValid} type="validation" />
        ),
      },
      // Actions Column
      {
        id: "actions",
        header: "",
        size: 50,
        cell: ({ row }) => {
          const isAdmin = user?.role?.toUpperCase() === "ADMIN";
          if (!isAdmin) return null;
          return (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDeleteRow?.(row.index)}
                title="Delete Row"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [onCellEdit, onDeleteRow, rows.length, user?.role]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 15,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto border border-border rounded-lg bg-card relative shadow-sm"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse text-left table-fixed">
        <thead className="bg-muted sticky top-0 z-20 shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-2 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {paddingTop > 0 && (
            <tr>
              <td
                style={{ height: `${paddingTop}px` }}
                colSpan={columns.length}
              />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                className={cn(
                  "group transition-colors",
                  row.getIsSelected()
                    ? "bg-primary/10 hover:bg-primary/20"
                    : "bg-card hover:bg-muted/50 dark:hover:bg-muted/20"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-0 border-b border-border align-middle relative"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                style={{ height: `${paddingBottom}px` }}
                colSpan={columns.length}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
