// src/app/_hooks/useTimerGuard.ts
"use client";

import { useState, useEffect } from "react";

export function useTimerGuard() {
  const [isLearning, setIsLearning] = useState(false);

  // ✅ タイマー実行中かどうかを判断するためのロジック
  // isLearning: React側の状態管理
  // localStorageにlearning_start_timeがあるかどうかも併用してチェックする
  const isActuallyLearning =
    isLearning && localStorage.getItem("learning_start_time") !== null;

  // ✅ 初回マウント時にlocalStorageの不正な値をクリーンアップ
  useEffect(() => {
    const stored = localStorage.getItem("learning_start_time");
    if (stored) {
      const parsed = new Date(stored);
      if (isNaN(parsed.getTime())) {
        // 無効な日付なら削除
        localStorage.removeItem("learning_start_time");
        return;
      }

      const now = Date.now();
      const elapsed = now - parsed.getTime();

      // 任意の期限（12時間以上前など）を過ぎていたら削除
      if (elapsed > 1000 * 60 * 60 * 12) {
        localStorage.removeItem("learning_start_time");
      }
    }
  }, []);

  return {
    isLearning: isActuallyLearning, // ✅ タイマー実行中判定
    startTimer: () => {
      const now = new Date().toISOString();
      localStorage.setItem("learning_start_time", now);
      setIsLearning(true);
    },
    stopTimer: () => {
      localStorage.removeItem("learning_start_time");
      setIsLearning(false);
    },
  };
}
