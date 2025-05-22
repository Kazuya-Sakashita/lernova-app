"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useWeeklyChart(userId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/user/weekly-chart-data?supabaseUserId=${userId}` : null,
    fetcher
  );

  return {
    weeklyChart: data,
    isLoading,
    isError: error,
  };
}
