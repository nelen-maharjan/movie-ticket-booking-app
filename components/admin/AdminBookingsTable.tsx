"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type Booking = any;

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
};

export function AdminBookingsTable({ data }: { data: Booking[] }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: "Ref",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-cinema-gold">
          {row.original.bookingRef.slice(0, 12).toUpperCase()}
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.user.email}
          </span>
        </div>
      ),
    },
    {
      id: "movie",
      header: "Movie",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.showtime.movie.title}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.original.showtime.screen.theater.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "showtime.startTime",
      header: "Show Time",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.original.showtime.startTime)}
        </span>
      ),
    },
    {
      id: "seats",
      header: "Seats",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.bookingSeats.length} seat
          {row.original.bookingSeats.length > 1 ? "s" : ""}
        </span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-cinema-gold">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANTS[row.original.status] || "outline"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Cancel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredData = React.useMemo(() => {
    let filtered = data;

    if (statusFilter) {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    return filtered;
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* 🔍 Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <Input
          placeholder="Search bookings..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

        {/* Status Filters */}
        <div className="flex gap-2">
          {["ALL", "CONFIRMED", "PENDING", "CANCELLED"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={
                (s === "ALL" && !statusFilter) || statusFilter === s
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setStatusFilter(s === "ALL" ? null : s)
              }
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* 🧾 Table */}
      <div className="rounded-xl border bg-background/60 backdrop-blur">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}