"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@ui/use-toast";
import { Toaster } from "@ui/toaster";
import LearningInfoCard from "./_components/LearningInfoCard";
import LearningContentCard from "./_components/LearningContentCard";
import LearningTimerCard from "./_components/LearningTimerCard";
import RecentLearningCard, {
  LearningRecord,
} from "./_components/RecentLearningCard";
import { formatTime } from "@/app/_utils/timeUtils";
import { RawLearningRecord } from "@/app/_types/formTypes";

const STORAGE_KEY = "lernova_learning_records";

export default function TimeInputPage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLearning, setIsLearning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [recentLearning, setRecentLearning] = useState<LearningRecord[]>([]);

  // localStorage から一度だけ読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const arr = (JSON.parse(saved) as RawLearningRecord[]).map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          startTime: new Date(r.startTime),
          endTime: new Date(r.endTime),
          content: r.content,
        }));
        setRecentLearning(arr.slice(0, 5));
      } catch {
        console.error("parse error");
      }
    }
  }, []);

  // スタート
  const handleStart = useCallback(() => {
    if (!title) {
      return toast({ title: "タイトルが必要です", variant: "destructive" });
    }
    if (!category && !newCategory) {
      return toast({ title: "カテゴリが必要です", variant: "destructive" });
    }
    setIsLearning(true);
    const now = new Date();
    setStartTime(now);
    localStorage.setItem("learning_start_time", now.toISOString());
    toast({ title: "学習タイマー開始", description: `${title}を記録中` });
  }, [title, category, newCategory]);

  // ストップ
  const handleStop = useCallback(() => {
    const st = localStorage.getItem("learning_start_time");
    if (!st) {
      return toast({ title: "開始時間がありません", variant: "destructive" });
    }
    const start = new Date(st);
    const end = new Date();
    const sec = Math.floor((end.getTime() - start.getTime()) / 1000);

    const rec: LearningRecord = {
      id: Math.random().toString(36).slice(-8),
      title,
      category: category === "その他" ? newCategory : category,
      startTime: start,
      endTime: end,
      content,
    };

    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? (JSON.parse(raw) as RawLearningRecord[]) : [];
    arr.unshift({
      ...rec,
      startTime: rec.startTime.toISOString(),
      endTime: rec.endTime.toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

    setRecentLearning((prev) => [rec, ...prev].slice(0, 5));
    setIsLearning(false);
    setStartTime(null);
    toast({
      title: "学習停止",
      description: `${formatTime(sec)} の学習を記録しました`,
    });
  }, [title, category, newCategory, content]);

  // リセット
  const handleReset = useCallback(() => {
    setIsLearning(false);
    setStartTime(null);
    setTitle("");
    setCategory("");
    setNewCategory("");
    setContent("");
    toast({ title: "リセットしました" });
  }, []);

  // 「すべて表示」ボタン
  const onViewAll = useCallback(() => {
    router.push("/user/learning-record");
  }, [router]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習内容登録</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <LearningInfoCard
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            isLearning={isLearning}
          />
          <LearningContentCard content={content} setContent={setContent} />
          <LearningTimerCard
            isLearning={isLearning}
            startTime={startTime}
            handleStart={handleStart}
            handleStop={handleStop}
            handleReset={handleReset}
          />
        </div>
        <div className="space-y-6">
          <RecentLearningCard
            recentLearning={recentLearning}
            onViewAll={onViewAll}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
