"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

export function useCategoryDistribution() {
  const { data, error, isLoading } = useSWR(
    "/api/user/category-distribution",
    fetcher
  );

  return {
    categoryData: data,
    isLoading,
    isError: error,
  };
}
