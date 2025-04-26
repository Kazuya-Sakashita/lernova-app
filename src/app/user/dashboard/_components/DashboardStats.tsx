"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";
import { BarChart, BookOpen, Clock, Users } from "lucide-react";

interface DashboardStatsProps {
  weeklyDuration: number;
  diffText: string;
  learningStreak: number;
  bestStreak: number;
}

const DashboardStats = ({
  weeklyDuration,
  diffText,
  learningStreak,
  bestStreak,
}: DashboardStatsProps) => {
  const stats = [
    {
      title: "今週の学習時間",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      value: `${weeklyDuration.toFixed(1)}時間`,
      note: diffText,
    },
    {
      title: "学習カテゴリ",
      icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
      value: "5",
      note: "先月比 +1カテゴリ",
      isUnderDevelopment: true,
    },
    {
      title: "継続日数",
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
      value: `${learningStreak}日`,
      note:
        learningStreak >= bestStreak
          ? "🎉 自己ベスト更新中！"
          : `自己ベスト: ${bestStreak}日`,
    },
    {
      title: "フォロワー",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      value: "12",
      note: "先週比 +3人",
      isUnderDevelopment: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.isUnderDevelopment && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-400 bg-yellow-100"
                >
                  開発中
                </Badge>
              )}
            </div>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
