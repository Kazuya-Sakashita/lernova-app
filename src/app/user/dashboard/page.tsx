"use client";

// フロントエンド用のフックと各種コンポーネントをインポート
import useSWR from "swr";
import { useSession } from "@utils/session";
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";
import { fetcher } from "@utils/fetcher"; // SWRで使用する共通フェッチ関数

export default function Home() {
  // ログイン中のユーザー情報を取得
  const { user } = useSession();
  const userId = user?.supabaseUserId ?? ""; // 空文字を使って条件付きuseSWRを避ける

  // =============================
  // 各種データの取得（userIdが空でも順番を崩さずにフック呼び出し）
  // =============================
  const { data: weeklyDurationData } = useSWR(
    userId
      ? `/api/user/weekly-learning-duration?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  const { data: weeklyChart } = useSWR(
    userId ? `/api/user/weekly-chart-data?supabaseUserId=${userId}` : null,
    fetcher
  );

  const { data: categoryRaw } = useSWR(
    userId ? `/api/user/category-distribution?supabaseUserId=${userId}` : null,
    fetcher
  );

  const { data: heatmapData } = useSWR(
    userId ? `/api/user/heatmap?supabaseUserId=${userId}` : null,
    fetcher
  );

  const { data: recentRecords } = useSWR(
    userId
      ? `/api/user/recent-learning-records?supabaseUserId=${userId}`
      : null,
    fetcher
  );

  const { data: streakData } = useSWR(
    userId ? `/api/user/learning-streak?supabaseUserId=${userId}` : null,
    fetcher
  );

  // =============================
  // データ整形
  // =============================
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

  const learningStreak = streakData?.streak ?? 0;
  const bestStreak = streakData?.bestStreak ?? 0;

  // =============================
  // ログインしていない場合は描画しない
  // =============================
  if (!user?.supabaseUserId) return null;

  // =============================
  // UI描画
  // =============================
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <DashboardHeader />

      {/* 今週の学習統計（継続日数含む） */}
      <DashboardStats
        weeklyDuration={weeklyDuration}
        diffText={diffText}
        learningStreak={learningStreak}
        bestStreak={bestStreak}
      />

      {/* 週間学習時間（棒グラフ）＋ カテゴリ別学習（円グラフ） */}
      <WeeklyCharts chartData={chartData} categoryData={categoryData} />

      {/* ヒートマップ */}
      <HeatmapSection data={heatmapData ?? []} />

      {/* 最近の記録 & 今月の目標 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentRecords records={recentRecords ?? []} />
        <MonthlyGoals />
      </div>
    </div>
  );
}
