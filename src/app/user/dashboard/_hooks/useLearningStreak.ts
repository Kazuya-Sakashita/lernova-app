"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useLearningStreak(userId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/user/learning-streak?supabaseUserId=${userId}` : null,
    fetcher
  );

  return {
    streakData: data,
    isLoading,
    isError: error,
  };
}
