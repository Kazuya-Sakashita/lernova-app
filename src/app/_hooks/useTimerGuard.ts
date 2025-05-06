import { useState } from "react";

export function useTimerGuard() {
  const [isLearning, setIsLearning] = useState(false);

  return {
    isLearning,
    startTimer: () => setIsLearning(true),
    stopTimer: () => setIsLearning(false),
  };
}
