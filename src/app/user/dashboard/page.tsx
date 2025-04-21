"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "@utils/session";
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";
import { fetcher } from "@utils/fetcher";

export default function Home() {
  // -----------------------------
  // 認証済みユーザー情報の取得
  // -----------------------------
  const { user } = useSession();

  // -----------------------------
  // 今週と先週の合計学習時間を取得（棒グラフ概要・差分表示用）
  // -----------------------------
  const { data } = useSWR(
    user?.supabaseUserId
      ? `/api/user/weekly-learning-duration?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  const weeklyDuration = data?.weeklyDuration ?? 0;
  const lastWeekDuration = data?.lastWeekDuration ?? 0;

  // 差分の計算・テキスト化
  const diff = weeklyDuration - lastWeekDuration;
  const diffText =
    diff === 0
      ? "先週と同じ"
      : `先週比 ${diff > 0 ? "+" : ""}${diff.toFixed(1)}時間`;

  // -----------------------------
  // 曜日別の週間学習データを取得（棒グラフ用）
  // -----------------------------
  const { data: weeklyChart } = useSWR(
    user?.supabaseUserId
      ? `/api/user/weekly-chart-data?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // 取得データを Chart.js 形式に整形（未取得時は初期値でフォールバック）
  const chartData = weeklyChart
    ? {
        labels: weeklyChart.labels,
        datasets: [
          {
            label: "学習時間",
            data: weeklyChart.data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      }
    : {
        labels: ["月", "火", "水", "木", "金", "土", "日"],
        datasets: [
          {
            label: "学習時間",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      };

  console.log("📊 週間チャートデータ:", chartData);

  // -----------------------------
  // カテゴリ別学習時間を取得（円グラフ用）
  // -----------------------------
  const { data: categoryRaw } = useSWR(
    user?.supabaseUserId
      ? `/api/user/category-distribution?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // カテゴリ別データを Chart.js 形式に整形（未取得時は空データ）
  const categoryData = categoryRaw
    ? {
        labels: categoryRaw.labels,
        datasets: [
          {
            data: categoryRaw.data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
          },
        ],
      }
    : {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
      };

  console.log("📊 カテゴリ別データ:", categoryData);

  // -----------------------------
  // ヒートマップ表示用の仮データ（直近90日間の学習量）
  // -----------------------------
  const [heatmapData] = useState(() => {
    const today = new Date();
    return Array.from({ length: 90 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return { date, hours: Math.random() * 5 };
    });
  });

  // -----------------------------
  // ダッシュボード表示UI
  // -----------------------------
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats weeklyDuration={weeklyDuration} diffText={diffText} />
      <WeeklyCharts chartData={chartData} categoryData={categoryData} />
      <HeatmapSection data={heatmapData} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentRecords />
        <MonthlyGoals />
      </div>
    </div>
  );
}
