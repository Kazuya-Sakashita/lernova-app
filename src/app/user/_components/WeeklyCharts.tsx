"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { LearningProgressChart } from "@/app/_components/learning-progress-chart";
import { CategoryChart } from "@/app/_components/category-chart";

interface Props {
  chartData: any;
  categoryData: any;
}

const WeeklyCharts = ({ chartData, categoryData }: Props) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>週間学習時間</CardTitle>
      </CardHeader>
      <CardContent>
        <LearningProgressChart data={chartData} />
      </CardContent>
    </Card>
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>カテゴリ別学習時間</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryChart data={categoryData} />
      </CardContent>
    </Card>
  </div>
);

export default WeeklyCharts;
