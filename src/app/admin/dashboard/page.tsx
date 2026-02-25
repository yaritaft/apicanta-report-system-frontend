"use client";

import { useStudentsStatus } from "@/hooks/use-students-status";
import { DashboardTable } from "@/components/admin/dashboard-table";
import { DevToolbar } from "@/components/admin/dev-toolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { isDev } from "@/lib/env";

export default function DashboardPage() {
  const { data, isLoading, refresh, useMock, toggleMock } =
    useStudentsStatus();

  return (
    <div className="space-y-4">
      {isDev && (
        <DevToolbar
          onMockToggle={toggleMock}
          isMockActive={useMock}
          onRefresh={refresh}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Estado semanal de los estudiantes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refresh()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refrescar
        </Button>
      </div>

      {isLoading && data.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DashboardTable data={data} />
      )}
    </div>
  );
}
