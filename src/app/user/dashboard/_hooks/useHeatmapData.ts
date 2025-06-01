"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

// -----------------------------
// ✅ 学習ヒートマップデータを取得するカスタムフック
// -----------------------------
// API側でセッションから supabaseUserId を取得するため、引数は不要
export function useHeatmapData() {
  const { data, error, isLoading } = useSWR(
    "/api/user/heatmap", // ✅ 固定のキャッシュキー
    fetcher
  );

  return {
    heatmapData: data,
    isLoading,
    isError: error,
  };
}
