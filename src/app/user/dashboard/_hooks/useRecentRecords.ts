"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

// -----------------------------
// ✅ 最近の学習記録を取得するカスタムフック
// -----------------------------
// セッションベースで supabaseUserId を取得するため、引数不要
export function useRecentRecords() {
  const { data, error, isLoading } = useSWR(
    "/api/user/recent-learning-records", // ✅ クエリなしの固定エンドポイント
    fetcher
  );

  return {
    recentRecords: data,
    isLoading,
    isError: error,
  };
}
