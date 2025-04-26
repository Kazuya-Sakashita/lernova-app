"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Badge } from "@ui/badge"; // ✅ バッジをインポート

const goals = [
  { title: "週30時間の学習", percent: 70 },
  { title: "5つの新しいスキル習得", percent: 40 },
  { title: "プロジェクト完成", percent: 20 },
];

const MonthlyGoals = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <CardTitle>今月の目標</CardTitle>
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-400 bg-yellow-100"
        >
          開発中
        </Badge>{" "}
        {/* ✅ 開発中バッジ追加 */}
      </div>
      <CardDescription>達成状況</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {goals.map((goal, i) => (
          <div key={i}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{goal.title}</div>
              <div className="text-sm text-muted-foreground">
                {goal.percent}%
              </div>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-pink-500"
                style={{ width: `${goal.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default MonthlyGoals;
