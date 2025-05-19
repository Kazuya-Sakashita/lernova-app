"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { LearningProgressChart } from "@/app/_components/learning-progress-chart";
import { CategoryChart } from "@/app/_components/category-chart";
import type { BarChartData, PieChartData } from "@/app/_types/chartTypes";

// ================================
// Props 型定義
// ================================

/**
 * @property chartData - 週間学習時間の棒グラフに使用するデータ
 * @property categoryData - カテゴリ別学習時間の円グラフに使用するデータ
 */
interface Props {
  chartData: BarChartData;
  categoryData: PieChartData;
}

// ================================
// 表示コンポーネント：WeeklyCharts
// ================================

/**
 * ユーザーの週間学習データを棒グラフと円グラフで視覚化するコンポーネント
 */
const WeeklyCharts = ({ chartData, categoryData }: Props) => (
  console.log("WeeklyCharts", { chartData, categoryData }),
  (
    // Gridレイアウト：左4列に棒グラフ、右3列に円グラフを表示
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* 左：棒グラフ（週間学習時間） */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>週間学習時間</CardTitle>
        </CardHeader>
        <CardContent>
          <LearningProgressChart
            // `labels!` はundefinedでない前提の明示。型安全を保ちたい場合は別途バリデーションが理想
            data={{ ...chartData, labels: chartData.labels! }}
          />
        </CardContent>
      </Card>

      {/* 右：円グラフ（カテゴリ別） */}
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>カテゴリ別学習時間</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryChart
            data={{ ...categoryData, labels: categoryData.labels! }}
          />
        </CardContent>
      </Card>
    </div>
  )
);

export default WeeklyCharts;
