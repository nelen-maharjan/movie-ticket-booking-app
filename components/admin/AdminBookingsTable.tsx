/* eslint-disable react-hooks/incompatible-library */
"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
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
import { BookingWithRelations } from "@/lib/types/booking";

const STATUS_VARIANTS: Record<
  BookingWithRelations["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
  EXPIRED: "outline",
};

export function AdminBookingsTable({
  data,
}: {
  data: BookingWithRelations[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<
    BookingWithRelations["status"] | null
  >(null);

  const columns: ColumnDef<BookingWithRelations>[] = [
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
        <div>
          <p className="text-sm font-medium">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.user.email}
          </p>
        </div>
      ),
    },
    {
      id: "movie",
      header: "Movie",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">
            {row.original.showtime.movie.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.showtime.screen.theater.name}
          </p>
        </div>
      ),
    },
    {
      id: "showtime",
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
      cell: ({ row }) => {
        const count = row.original.bookingSeats.length;
        return (
          <span className="text-sm">
            {count} seat{count > 1 ? "s" : ""}
          </span>
        );
      },
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
        <Badge variant={STATUS_VARIANTS[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: () => (
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
    if (!statusFilter) return data;
    return data.filter((b) => b.status === statusFilter);
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
  globalFilterFn: (row, _, value) => {
    const search = value.toLowerCase();

    return (
      row.original.bookingRef.toLowerCase().includes(search) ||
      row.original.user.name?.toLowerCase().includes(search) ||
      row.original.user.email?.toLowerCase().includes(search) ||
      row.original.showtime.movie.title.toLowerCase().includes(search)
    );
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:justify-between">
        <Input
          placeholder="Search bookings..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />

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
                setStatusFilter(
                  s === "ALL" ? null : (s as BookingWithRelations["status"])
                )
              }
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer"
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
                <TableRow key={row.id}>
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
    </div>
  );
}