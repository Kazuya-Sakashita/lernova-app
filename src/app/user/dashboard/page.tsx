"use client";

// 必要なHooksやコンポーネントをインポート
import useSWR from "swr";
import { useSession } from "@utils/session"; // 認証済みユーザー情報の取得
import DashboardHeader from "@/app/user/dashboard/_components/DashboardHeader";
import DashboardStats from "@/app/user/dashboard/_components/DashboardStats";
import WeeklyCharts from "@/app/user/dashboard/_components/WeeklyCharts";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import RecentRecords from "@/app/user/dashboard/_components/RecentRecords";
import MonthlyGoals from "@/app/user/dashboard/_components/MonthlyGoals";
import { fetcher } from "@utils/fetcher"; // 共通のデータフェッチ関数

export default function Home() {
  // -------------------------------
  // 認証済みユーザー情報の取得
  // -------------------------------
  const { user } = useSession();

  // -------------------------------
  // 今週と先週の合計学習時間データを取得
  // -------------------------------
  const { data } = useSWR(
    user?.supabaseUserId
      ? `/api/user/weekly-learning-duration?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // デフォルトは 0 時間
  const weeklyDuration = data?.weeklyDuration ?? 0;
  const lastWeekDuration = data?.lastWeekDuration ?? 0;

  // 差分テキスト生成（±表示）
  const diff = weeklyDuration - lastWeekDuration;
  const diffText =
    diff === 0
      ? "先週と同じ"
      : `先週比 ${diff > 0 ? "+" : ""}${diff.toFixed(1)}時間`;

  // -------------------------------
  // 曜日別の週間学習時間データを取得（棒グラフ用）
  // -------------------------------
  const { data: weeklyChart } = useSWR(
    user?.supabaseUserId
      ? `/api/user/weekly-chart-data?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // Chart.js 形式に整形（未取得時は初期値）
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

  // -------------------------------
  // カテゴリ別学習時間データを取得（円グラフ用）
  // -------------------------------
  const { data: categoryRaw } = useSWR(
    user?.supabaseUserId
      ? `/api/user/category-distribution?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  // Chart.js 形式に整形（未取得時は空）
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

  // -------------------------------
  // ヒートマップ用データを取得（直近90日分）
  // -------------------------------
  const { data: heatmapData } = useSWR(
    user?.supabaseUserId
      ? `/api/user/heatmap?supabaseUserId=${user.supabaseUserId}`
      : null,
    fetcher
  );

  console.log("🔥 ヒートマップデータ:", heatmapData);

  // -------------------------------
  // ダッシュボードの描画
  // -------------------------------
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <DashboardHeader />

      {/* 今週の統計（合計時間・差分） */}
      <DashboardStats weeklyDuration={weeklyDuration} diffText={diffText} />

      {/* チャート：棒グラフと円グラフ */}
      <WeeklyCharts chartData={chartData} categoryData={categoryData} />

      {/* ヒートマップ（直近90日） */}
      <HeatmapSection data={heatmapData ?? []} />

      {/* 最近の記録 & 今月の目標 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentRecords />
        <MonthlyGoals />
      </div>
    </div>
  );
}
