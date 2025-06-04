"use client";

import useSWR, { mutate } from "swr";
import { RawRecord } from "@/app/_types/formTypes";

// -----------------------------
// ✅ APIからデータを取得するフェッチャー関数
// -----------------------------
// fetch を使って指定URLのJSONを取得
// エラーがある場合は例外を投げる
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("データ取得失敗");
  return res.json();
};

// -----------------------------
// ✅ SWRで使用するキャッシュキー
// -----------------------------
// APIが期間パラメータ（3ヶ月）を受け取る前提で定義
const RECORDS_KEY = "/api/user/learning-record?period=3months";

// -----------------------------
// ✅ 学習記録を取得するカスタムフック
// -----------------------------
// Supabaseセッション経由でログインユーザーに紐づく記録を取得
// userIdは不要。APIがセッションから取得する前提
export function useLearningRecords() {
  // SWRでデータ取得
  const { data, error, isLoading } = useSWR<RawRecord[]>(RECORDS_KEY, fetcher);

  // ✅ 手動でキャッシュを再取得（再レンダリングが必要な場合など）
  const refreshLearningRecords = async () => {
    try {
      const records = await fetcher(RECORDS_KEY); // APIから再取得
      mutate(RECORDS_KEY, records, false); // 再検証なしでキャッシュ更新
    } catch (error) {
      console.error("学習記録の更新エラー:", error);
    }
  };

  return {
    records: data,
    isLoading, // データ取得中フラグ
    isError: error, // エラー内容
    refreshLearningRecords, // 手動更新用関数
  };
}

// -----------------------------
// ✅ 学習記録を事前にSWRキャッシュに保存する関数
// -----------------------------
// 例: ログイン直後などにプリロードする用途で使用
export async function preloadLearningRecords() {
  try {
    const records = await fetcher(RECORDS_KEY); // データ取得
    mutate(RECORDS_KEY, records, false); // SWR キャッシュに事前保存（再検証なし）
  } catch (error) {
    console.error("学習記録の事前読み込みに失敗:", error);
  }
}
