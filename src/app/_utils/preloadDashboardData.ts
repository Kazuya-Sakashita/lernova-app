"use client";

import { mutate } from "swr";

// 共通fetcher関数
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`プリロード失敗: ${url}`);
  return res.json();
};

export async function preloadDashboardData() {
  const targets: string[] = [
    "/api/user/learning-record?period=3months",
    "/api/user/weekly-learning-duration",
    "/api/user/weekly-chart-data",
    "/api/user/category-distribution",
    "/api/user/heatmap",
    "/api/user/recent-learning-records",
    "/api/user/learning-streak",
  ];

  console.log("🚀 プリロード開始");

  await Promise.all(
    targets.map(async (url) => {
      try {
        const data = await fetcher(url);
        // ✅ SWRのキャッシュにプリロード結果を格納（再フェッチなし）
        mutate(url, data, false);
        console.log("✅ プリロード完了:", url, data);
      } catch (err) {
        console.error("❌ プリロード失敗:", url, err);
      }
    })
  );

  console.log("🏁 プリロード全体完了");
}
