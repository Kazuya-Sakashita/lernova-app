// src/app/_hooks/useWeeklyLearningDuration.ts
"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useWeeklyLearningDuration(userId: string | undefined) {
  const shouldFetch = !!userId;
  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `/api/user/weekly-learning-duration?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  return {
    weeklyDurationData: data,
    isLoading,
    isError: error,
  };
}
