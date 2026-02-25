"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { getStudentsStatus } from "@/lib/api";
import { mockStudentsStatus } from "@/lib/mock-data";
import { isDev } from "@/lib/env";
import type { StudentStatus } from "@/types";

const REVALIDATE_INTERVAL = 5 * 60 * 1000;

export function useStudentsStatus() {
  const [useMock, setUseMock] = useState(false);

  const fetcher = useCallback(async (): Promise<StudentStatus[]> => {
    if (useMock && isDev) {
      await new Promise((r) => setTimeout(r, 200));
      return mockStudentsStatus;
    }
    return getStudentsStatus();
  }, [useMock]);

  const { data, error, isLoading, mutate } = useSWR<StudentStatus[]>(
    useMock ? "students-status-mock" : "students-status",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: useMock ? 0 : REVALIDATE_INTERVAL,
      dedupingInterval: 30_000,
    },
  );

  const toggleMock = useCallback(() => {
    setUseMock((prev) => !prev);
  }, []);

  return {
    data: data ?? [],
    error,
    isLoading,
    refresh: () => mutate(),
    useMock,
    toggleMock,
  };
}
