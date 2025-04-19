"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { calculateDuration } from "@/app/_utils/timeUtils";

export interface LearningRecord {
  id: string;
  title: string;
  category: string;
  startTime: Date;
  endTime: Date;
  content: string;
}

interface Props {
  recentLearning: LearningRecord[];
  onViewAll: () => void;
}

export default function RecentLearningCard({
  recentLearning,
  onViewAll,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>最近の学習記録</CardTitle>
          <CardDescription>直近の学習記録</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          すべて表示
        </Button>
      </CardHeader>
      <CardContent>
        {recentLearning.length > 0 ? (
          <div className="space-y-4">
            {recentLearning.map((r) => (
              <div key={r.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{r.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(r.startTime, "yyyy/MM/dd", { locale: ja })} ・
                      {calculateDuration(r.startTime, r.endTime)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-pink-50">
                    {r.category}
                  </Badge>
                </div>
                {r.content && (
                  <p className="text-sm mt-1 line-clamp-2">{r.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">最近の学習記録はありません。</p>
        )}
      </CardContent>
    </Card>
  );
}
