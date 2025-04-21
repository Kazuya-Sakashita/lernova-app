"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "@utils/session"; // Supabase セッション情報を取得
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";

// API フェッチ用の関数
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  // 認証済みユーザー情報を取得
  const { user } = useSession();

  // 今週と先週の学習時間データを取得
  const { data } = useSWR(
    user?.supabaseUserId
      ? `/api/user/weekly-learning-duration?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // 今週と先週の合計学習時間（0がデフォルト）
  const weeklyDuration = data?.weeklyDuration ?? 0;
  const lastWeekDuration = data?.lastWeekDuration ?? 0;

  // 差分の計算とテキスト生成
  const diff = weeklyDuration - lastWeekDuration;
  const diffText =
    diff === 0
      ? "先週と同じ"
      : `先週比 ${diff > 0 ? "+" : ""}${diff.toFixed(1)}時間`;

  // 週間チャート用のダミーデータ
  const chartData = {
    labels: ["月", "火", "水", "木", "金", "土", "日"],
    datasets: [
      {
        label: "学習時間",
        data: [2, 3, 1.5, 4, 2.5, 3.5, 2], // ダミー値
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // カテゴリ別円グラフのダミーデータ
  const categoryData = {
    labels: ["プログラミング", "語学", "数学", "科学", "歴史"],
    datasets: [
      {
        data: [30, 20, 15, 25, 10], // ダミー値
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };

  // ヒートマップ用のランダムな90日分データ
  const [heatmapData] = useState(() => {
    const today = new Date();
    return Array.from({ length: 90 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return { date, hours: Math.random() * 5 }; // 0〜5時間の範囲でランダム生成
    });
  });

  // ダッシュボードUIの描画
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
