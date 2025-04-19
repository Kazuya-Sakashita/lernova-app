// src/app/user/learning-record/_components/Timer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Props {
  isLearning: boolean;
  startTime: Date | null;
}

const Timer: React.FC<Props> = React.memo(({ isLearning, startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLearning || !startTime) {
      setElapsed(0);
      return;
    }
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [isLearning, startTime]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = Math.floor(elapsed / 3600);
  const mm = Math.floor((elapsed % 3600) / 60);
  const ss = elapsed % 60;

  return (
    <div className="text-center">
      <div className="flex items-center justify-center text-4xl font-bold mb-2 space-x-2">
        <Clock className="h-8 w-8 text-pink-500" />
        <span>{`${pad(hh)}:${pad(mm)}:${pad(ss)}`}</span>
      </div>
      {isLearning && startTime && (
        <p className="text-sm text-muted-foreground">
          開始時間: {startTime.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
});

Timer.displayName = "Timer";
export default Timer;
