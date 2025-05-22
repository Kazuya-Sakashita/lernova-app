"use client";

import { useSession } from "@utils/session";
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";
import { useWeeklyLearningDuration } from "./_hooks/useWeeklyLearningDuration";
import { useWeeklyChart } from "./_hooks/useWeeklyChart";
import { useCategoryDistribution } from "./_hooks/useCategoryDistribution";
import { useHeatmapData } from "./_hooks/useHeatmapData";
import { useRecentRecords } from "./_hooks/useRecentRecords";
import { useLearningStreak } from "./_hooks/useLearningStreak";

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

  const { weeklyDurationData } = useWeeklyLearningDuration(userId);
  const { weeklyChart } = useWeeklyChart(userId);
  const { categoryData } = useCategoryDistribution(userId);
  const { heatmapData } = useHeatmapData(userId);
  const { recentRecords } = useRecentRecords(userId);
  const { streakData } = useLearningStreak(userId);

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

  const categoryChartData = categoryData
    ? {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.data,
            backgroundColor: generateBackgroundColors(
              categoryData.labels.length
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
      <WeeklyCharts chartData={chartData} categoryData={categoryChartData} />
      <HeatmapSection data={heatmapData ?? []} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentRecords records={recentRecords ?? []} />
        <MonthlyGoals />
      </div>
    </div>
  );
}
