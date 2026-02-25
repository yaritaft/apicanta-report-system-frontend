"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import type { StudentStatus } from "@/types";
import { isDev } from "@/lib/env";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, ExternalLink } from "lucide-react";

const PAGE_SIZE = 50;

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  not_sent: { label: "Sin enviar", className: "bg-gray-100 text-gray-600 border-gray-200" },
  pending: { label: "Pendiente", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completado", className: "bg-green-50 text-green-700 border-green-200" },
  expired: { label: "Venció", className: "bg-red-50 text-red-600 border-red-200" },
};

type FilterValue = "all" | "active" | "inactive" | "completed" | "pending";

const quickFilters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "completed", label: "Completaron Form (Esta Semana)" },
  { value: "pending", label: "No Completaron Form (Todavía)" },
];

function applyFilter(
  data: StudentStatus[],
  filter: FilterValue,
): StudentStatus[] {
  switch (filter) {
    case "active":
      return data.filter((r) => r.isActive);
    case "inactive":
      return data.filter((r) => !r.isActive);
    case "completed":
      return data.filter((r) => r.weekStatus === "completed");
    case "pending":
      return data.filter(
        (r) => r.weekStatus === "pending" || r.weekStatus === "not_sent",
      );
    default:
      return data;
  }
}

function buildColumns(): ColumnDef<StudentStatus>[] {
  const cols: ColumnDef<StudentStatus>[] = [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Activo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const active = row.getValue("isActive") as boolean;
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              active
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      accessorKey: "weekStatus",
      header: () => (
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
          Estado Form
        </span>
      ),
      cell: ({ row }) => {
        const status = row.getValue("weekStatus") as string;
        const config = statusConfig[status] || statusConfig.not_sent;
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "completedAt",
      header: () => (
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
          Completado
        </span>
      ),
      cell: ({ row }) => {
        const val = row.getValue("completedAt") as string | null;
        return val ? (
          new Date(val).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "consecutiveWeeksMissed",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
            Sem. sin completar
          </span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const count = row.getValue("consecutiveWeeksMissed") as number;
        if (count === 0)
          return <span className="text-muted-foreground">0</span>;
        return (
          <span
            className={
              count >= 3 ? "font-semibold text-destructive" : "text-foreground"
            }
          >
            {count}
          </span>
        );
      },
    },
  ];

  if (isDev) {
    cols.push({
      accessorKey: "magicLink",
      header: () => (
        <span className="text-amber-600 font-normal text-xs">Magic Link</span>
      ),
      cell: ({ row }) => {
        const link = row.getValue("magicLink") as string | null;
        if (!link) return <span className="text-muted-foreground">—</span>;
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 underline"
          >
            Abrir <ExternalLink className="h-3 w-3" />
          </a>
        );
      },
    });
  }

  cols.push(
    {
      accessorKey: "externalId",
      header: () => (
        <span className="text-muted-foreground font-normal">ID Externo</span>
      ),
      cell: ({ row }) => {
        const val = row.getValue("externalId") as string;
        return (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(val)}
            title="Click para copiar"
            className="cursor-copy text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
          >
            {val}
          </button>
        );
      },
    },
    {
      accessorKey: "studentId",
      header: () => (
        <span className="text-muted-foreground font-normal">ID (DB)</span>
      ),
      cell: ({ row }) => {
        const val = row.getValue("studentId") as string;
        return (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(val)}
            title="Click para copiar ID completo"
            className="cursor-copy text-xs text-muted-foreground font-mono hover:text-foreground transition-colors"
          >
            {val.slice(0, 8)}...
          </button>
        );
      },
    },
  );

  return cols;
}

const columns = buildColumns();

export function DashboardTable({ data }: { data: StudentStatus[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let result = applyFilter(data, activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.externalId.toLowerCase().includes(q),
      );
    }
    return result;
  }, [data, activeFilter, search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, search]);

  const visibleData = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { root: scrollRef.current, rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const table = useReactTable({
    data: visibleData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              {filter.value !== "all" && (
                <span className="ml-1.5 text-xs opacity-70">
                  {applyFilter(data, filter.value).length}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Mostrando {visibleData.length} de {filtered.length} estudiantes
      </p>

      <div className="rounded-md border overflow-hidden">
        <div
          ref={scrollRef}
          className="max-h-[calc(100vh-320px)] overflow-y-auto"
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay resultados para esta búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div ref={sentinelRef} className="h-1" />
          {hasMore && (
            <p className="py-3 text-center text-sm text-muted-foreground">
              Cargando más...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
