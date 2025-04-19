// src/app/user/learning-record/_components/RecentLearningCard.tsx

"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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

const RecentLearningCard: React.FC<Props> = ({ recentLearning, onViewAll }) => (
  <Card>
    <CardHeader className="flex justify-between items-center">
      <CardTitle>最近の学習記録</CardTitle>
      <Button size="sm" variant="outline" onClick={onViewAll}>
        すべて表示
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      {recentLearning.length === 0 ? (
        <p className="text-muted-foreground">記録がありません</p>
      ) : (
        recentLearning.map((r) => (
          <div key={r.id} className="border-b pb-2">
            <h4 className="font-medium">{r.title}</h4>
            <p className="text-sm text-muted-foreground">
              {format(r.startTime, "yyyy/MM/dd", { locale: ja })}・
              {Math.floor(
                (r.endTime.getTime() - r.startTime.getTime()) / 60000
              )}
              分
            </p>
            {/* ← ここで学習内容を表示 */}
            {r.content && (
              <p className="text-sm mt-1 line-clamp-2">{r.content}</p>
            )}
          </div>
        ))
      )}
    </CardContent>
  </Card>
);

export default React.memo(RecentLearningCard);
