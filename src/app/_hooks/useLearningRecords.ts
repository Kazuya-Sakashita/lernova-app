"use client";

import useSWR, { mutate } from "swr";
import { RawRecord } from "@/app/_types/formTypes";

// -----------------------------
// フェッチャー関数
// -----------------------------
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("データ取得失敗");
  return res.json();
};

// -----------------------------
// SWRキャッシュキーの生成関数
// -----------------------------
const RECORDS_KEY = (userId: string) =>
  `/api/user/learning-record?supabaseUserId=${userId}&period=3months`;

// -----------------------------
// SWRによる学習記録取得フック
// -----------------------------
export function useLearningRecords(userId?: string) {
  const { data, error, isLoading } = useSWR<RawRecord[]>(
    userId ? RECORDS_KEY(userId) : null,
    fetcher
  );

  // ✅ 手動でキャッシュ更新（再取得）
  const refreshLearningRecords = async (userId: string) => {
    if (!userId) return;
    const url = RECORDS_KEY(userId);
    try {
      const records = await fetcher(url);
      mutate(url, records, false); // 再検証なしでキャッシュ更新
    } catch (error) {
      console.error("学習記録の更新エラー:", error);
    }
  };

  return {
    records: data,
    isLoading,
    isError: error,
    refreshLearningRecords,
  };
}

// -----------------------------
// ✅ ログイン時のプリロード関数（SWRキャッシュへ保存）
// -----------------------------
export async function preloadLearningRecords(userId: string) {
  const url = RECORDS_KEY(userId);
  try {
    const records = await fetcher(url);
    mutate(url, records, false); // SWR キャッシュに保存
  } catch (error) {
    console.error("学習記録の事前読み込みに失敗:", error);
  }
}
