"use client";

import useSWR, { mutate } from "swr";
import { RawRecord } from "@/app/_types/formTypes";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("データ取得失敗");
  return res.json();
};

const RECORDS_KEY = (userId: string) =>
  `/api/user/learning-record?supabaseUserId=${userId}&period=3months`;

export function useLearningRecords(userId?: string) {
  const { data, error, isLoading } = useSWR<RawRecord[]>(
    userId ? RECORDS_KEY(userId) : null,
    fetcher
  );

  const refreshLearningRecords = async (userId: string) => {
    if (!userId) return;
    const url = RECORDS_KEY(userId);
    try {
      const records = await fetcher(url);
      mutate(url, records, false);
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
