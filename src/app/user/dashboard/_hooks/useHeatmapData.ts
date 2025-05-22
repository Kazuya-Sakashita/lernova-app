"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useHeatmapData(userId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/user/heatmap?supabaseUserId=${userId}` : null,
    fetcher
  );

  return {
    heatmapData: data,
    isLoading,
    isError: error,
  };
}
