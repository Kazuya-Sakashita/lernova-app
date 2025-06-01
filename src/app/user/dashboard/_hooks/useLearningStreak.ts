"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

// -----------------------------
// ✅ 学習継続日数（連続学習記録）の取得フック
// -----------------------------
// セッションベースで supabaseUserId を取得するAPI前提なので userId 引数は不要
export function useLearningStreak() {
  const { data, error, isLoading } = useSWR(
    "/api/user/learning-streak", // クエリなしで固定パス
    fetcher
  );

  return {
    streakData: data,
    isLoading,
    isError: error,
  };
}
