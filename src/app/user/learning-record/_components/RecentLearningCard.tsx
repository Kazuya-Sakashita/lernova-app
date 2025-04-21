// src/app/user/learning-record/_components/RecentLearningCard.tsx
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { extractDateFromUTC } from "@/app/_utils/timeUtils";
import type { LearningRecord } from "@/app/_types/formTypes";

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
        recentLearning.map((r) => {
          // ここでは r.duration に保存されている float 値を「時間」として表示
          const hours = r.duration.toFixed(2);

          return (
            <div key={r.id} className="border-b pb-2">
              <h4 className="font-medium">{r.title}</h4>
              <p className="text-sm text-muted-foreground">
                {extractDateFromUTC(r.startTime)}・{hours}時間
              </p>
              {r.content && (
                <p className="text-sm mt-1 line-clamp-2">{r.content}</p>
              )}
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
);

export default React.memo(RecentLearningCard);
