"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useCategoryDistribution(userId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/user/category-distribution?supabaseUserId=${userId}` : null,
    fetcher
  );

  return {
    categoryData: data,
    isLoading,
    isError: error,
  };
}
