"use client";

import useSWR from "swr";
import { useSession } from "@utils/session";
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";
import { fetcher } from "@utils/fetcher";

const generateBackgroundColors = (count: number) => {
  const baseColors = [
    "rgba(255, 99, 132, 0.6)",
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ];
  return Array.from(
    { length: count },
    (_, i) => baseColors[i % baseColors.length]
  );
};

export default function Home() {
  const { user } = useSession();
  const userId = user?.supabaseUserId ?? "";

  // 今週と先週の学習時間を取得（週間統計で使用）
  const { data: weeklyDurationData } = useSWR(
    userId
      ? `/api/user/weekly-learning-duration?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  // 週間学習グラフ用データを取得（棒グラフで使用）
  const { data: weeklyChart } = useSWR(
    userId ? `/api/user/weekly-chart-data?supabaseUserId=${userId}` : null,
    fetcher
  );

  // カテゴリ別の学習割合データを取得（円グラフで使用）
  const { data: categoryRaw } = useSWR(
    userId ? `/api/user/category-distribution?supabaseUserId=${userId}` : null,
    fetcher
  );

  // ヒートマップ用の学習日データを取得
  const { data: heatmapData } = useSWR(
    userId ? `/api/user/heatmap?supabaseUserId=${userId}` : null,
    fetcher
  );

  // 最近の学習記録データを取得（直近5件程度）
  const { data: recentRecords } = useSWR(
    userId
      ? `/api/user/recent-learning-records?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  // 継続日数データ（現在の連続日数・過去最高記録）を取得
  const { data: streakData } = useSWR(
    userId ? `/api/user/learning-streak?supabaseUserId=${userId}` : null,
    fetcher
  );

  const weeklyDuration = weeklyDurationData?.weeklyDuration ?? 0;
  const lastWeekDuration = weeklyDurationData?.lastWeekDuration ?? 0;
  const diff = weeklyDuration - lastWeekDuration;
  const diffText =
    diff === 0
      ? "先週と同じ"
      : `先週比 ${diff > 0 ? "+" : ""}${diff.toFixed(1)}時間`;

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

  const categoryData = categoryRaw
    ? {
        labels: categoryRaw.labels,
        datasets: [
          {
            data: categoryRaw.data,
            backgroundColor: generateBackgroundColors(
              categoryRaw.labels.length
            ),
          },
        ],
      }
    : {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
      };

  const learningStreak = streakData?.streak ?? 0;
  const bestStreak = streakData?.bestStreak ?? 0;

  if (!user?.supabaseUserId) return null;

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardStats
        weeklyDuration={weeklyDuration}
        diffText={diffText}
        learningStreak={learningStreak}
        bestStreak={bestStreak}
      />
      <WeeklyCharts chartData={chartData} categoryData={categoryData} />
      <HeatmapSection data={heatmapData ?? []} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentRecords records={recentRecords ?? []} />
        <MonthlyGoals />
      </div>
    </div>
  );
}
