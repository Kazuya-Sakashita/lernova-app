// src/app/_utils/preloadDashboardData.ts
"use client";

import { mutate } from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`プリロード失敗: ${url}`);
  return res.json();
};

export async function preloadDashboardData() {
  const targets = [
    // 学習記録系
    "/api/user/learning-record?period=3months",
    "/api/user/weekly-learning-duration",
    "/api/user/weekly-chart-data",
    "/api/user/category-distribution",
    "/api/user/heatmap",
    "/api/user/recent-learning-records",
    "/api/user/learning-streak",
  ];

  await Promise.all(
    targets.map(async (url) => {
      try {
        const data = await fetcher(url);
        mutate(url, data, false);
        console.log("✅ プリロード完了:", url, data); // ← 追加
      } catch (err) {
        console.error("❌ プリロード失敗:", url, err);
      }
    })
  );
}
