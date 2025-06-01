"use client";

import useSWR from "swr";
import { fetcher } from "@/app/_utils/fetcher";

// -----------------------------
// ✅ 週間学習時間を取得するカスタムフック
// -----------------------------
// セッションベースで supabaseUserId を取得する API を前提にしているため、userId 引数は不要
export function useWeeklyLearningDuration() {
  // SWRによるデータ取得（キャッシュキーは固定）
  const { data, error, isLoading } = useSWR(
    "/api/user/weekly-learning-duration",
    fetcher
  );

  return {
    weeklyDurationData: data, // { weeklyDuration, lastWeekDuration } など
    isLoading,
    isError: error,
  };
}
