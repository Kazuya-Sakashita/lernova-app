"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useRecentRecords(userId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    userId
      ? `/api/user/recent-learning-records?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  return {
    recentRecords: data,
    isLoading,
    isError: error,
  };
}
