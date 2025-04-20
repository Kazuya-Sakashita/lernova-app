// src/app/user/learning-record/_components/LearningTimerCard.tsx
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
import { PlayCircle, StopCircle, RotateCcw } from "lucide-react";
import Timer from "./Timer";

interface Props {
  isLearning: boolean;
  startTime: Date | null;
  handleStart: () => void;
  handleStop: () => void;
  handleReset: () => void;
}

export default React.memo(function LearningTimerCard({
  isLearning,
  startTime,
  handleStart,
  handleStop,
  handleReset,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学習タイマー</CardTitle>
        <CardDescription>学習時間を記録します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Timer isLearning={isLearning} startTime={startTime} />
        <div className="flex gap-2">
          {!isLearning ? (
            <Button onClick={handleStart} className="flex-1 bg-pink-500">
              <PlayCircle className="mr-2 h-4 w-4" /> スタート
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              variant="destructive"
              className="flex-1"
            >
              <StopCircle className="mr-2 h-4 w-4" /> ストップ
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" /> リセット
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
