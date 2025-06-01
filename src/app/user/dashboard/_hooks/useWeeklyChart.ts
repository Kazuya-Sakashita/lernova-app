"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

// -----------------------------
// ✅ SWRによる週間学習チャート取得フック
// -----------------------------
// サーバー側でセッションから supabaseUserId を取得する前提
export function useWeeklyChart() {
  const { data, error, isLoading } = useSWR(
    "/api/user/weekly-chart-data", // ✅ クエリ不要、固定キーに
    fetcher
  );

  return {
    weeklyChart: data,
    isLoading,
    isError: error,
  };
}
