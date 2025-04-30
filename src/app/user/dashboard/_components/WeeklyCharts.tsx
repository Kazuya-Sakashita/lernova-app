"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { LearningProgressChart } from "@/app/_components/learning-progress-chart";
import { CategoryChart } from "@/app/_components/category-chart";

// ================================
// このファイル内でのみ使用するローカル型定義
// ================================

// 棒グラフ（週間学習時間）用のデータ型
interface BarChartData {
  labels: string[]; // 曜日などのラベル
  datasets: {
    label: string; // データセットのラベル（例: "学習時間"）
    data: number[]; // 各曜日の学習時間
    backgroundColor: string; // 棒グラフの色
  }[];
}

// 円グラフ（カテゴリ別）用のデータ型
interface PieChartData {
  labels: string[]; // カテゴリ名のラベル（例: "プログラミング", "数学"）
  datasets: {
    data: number[]; // 各カテゴリの学習時間
    backgroundColor: string[]; // 各カテゴリの円グラフ色
  }[];
}

// Props 型：グラフ2種のデータを受け取る
interface Props {
  chartData: BarChartData;
  categoryData: PieChartData;
}

// ================================
// 表示コンポーネント：WeeklyCharts
// ================================

const WeeklyCharts = ({ chartData, categoryData }: Props) => (
  console.log("WeeklyCharts", { chartData, categoryData }),
  (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* 左：棒グラフ（週間学習時間） */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>週間学習時間</CardTitle>
        </CardHeader>
        <CardContent>
          <LearningProgressChart
            data={{ ...chartData, labels: chartData.labels! }} // labels が undefined ではない前提で明示
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
            data={{ ...categoryData, labels: categoryData.labels! }} // 同様に labels 明示
          />
        </CardContent>
      </Card>
    </div>
  )
);

export default WeeklyCharts;
