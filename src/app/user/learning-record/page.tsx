"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/app/_components/ui/use-toast";
import { Toaster } from "@/app/_components/ui/toaster";
import LearningInfoCard from "./_components/LearningInfoCard";
import LearningContentCard from "./_components/LearningContentCard";
import LearningTimerCard from "./_components/LearningTimerCard";
import RecentLearningCard from "./_components/RecentLearningCard";
import type { RawRecord, LearningRecord } from "@/app/_types/formTypes";
import { convertToUTC } from "@/app/_utils/timeUtils";
import { format } from "date-fns";

export default function TimeInputPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [content, setContent] = useState("");

  const [isLearning, setIsLearning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recentLearning, setRecentLearning] = useState<LearningRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("learning_start_time");
    if (stored) {
      const parsed = new Date(stored);
      if (isNaN(parsed.getTime())) {
        localStorage.removeItem("learning_start_time");
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLearning) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (
        isLearning &&
        !window.confirm(
          "タイマーが実行中です。このまま移動するとタイマーが停止しますが、よろしいですか？"
        )
      ) {
        e.preventDefault();
        window.history.pushState(null, "", window.location.href);
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      if (isLearning) {
        const target = e.target as HTMLElement;
        if (target.closest("a")) {
          if (
            !window.confirm(
              "タイマーが実行中です。このまま移動するとタイマーが停止しますが、よろしいですか？"
            )
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleLinkClick);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick);
    };
  }, [isLearning]);

  const transformRecord = (raw: RawRecord): LearningRecord => ({
    id: raw.id,
    title: raw.title,
    categoryId: raw.category.id,
    content: raw.content,
    startTime: raw.start_time,
    endTime: raw.end_time,
    supabaseUserId: raw.supabaseUserId,
    date: new Date(raw.learning_date),
    duration: raw.duration,
  });

  const fetchLearningRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/user/learning-record", {
        method: "GET",
        credentials: "include", // ✅ クッキーを含めてセッションを送信
      });

      if (!res.ok) throw new Error("取得失敗");

      const data: RawRecord[] = await res.json();
      const list = data.map(transformRecord);
      list.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentLearning(list.slice(0, 5));
    } catch (err) {
      console.error("学習記録取得エラー", err);
      toast({
        title: "取得エラー",
        description: "学習記録の取得に失敗しました",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchLearningRecords();
  }, [fetchLearningRecords]);

  const handleStart = useCallback(() => {
    if (!title)
      return toast({ title: "タイトルが必要です", variant: "destructive" });
    if (!category && !newCategory)
      return toast({ title: "カテゴリが必要です", variant: "destructive" });

    setIsLearning(true);
    const now = new Date();
    setStartTime(now);
    localStorage.setItem("learning_start_time", now.toISOString());
    toast({ title: "タイマー開始", description: `${title} を記録中` });
  }, [title, category, newCategory]);

  const handleStop = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    const st = localStorage.getItem("learning_start_time");
    if (!st) {
      toast({ title: "開始時間がありません", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const start = new Date(st);
    const end = new Date();
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    const localDate = format(start, "yyyy-MM-dd");
    const localStartTime = format(start, "HH:mm");
    const localEndTime = format(end, "HH:mm");
    const utcStart = convertToUTC(localDate, localStartTime);
    const utcEnd = convertToUTC(localDate, localEndTime);

    const recordToSave = {
      title,
      categoryId:
        category === "その他" ? Number(newCategory) : Number(category),
      content,
      date: utcStart,
      startTime: utcStart,
      endTime: utcEnd,
      duration: durationHours,
    };

    try {
      const res = await fetch("/api/user/learning-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ 認証情報をクッキーで送信
        body: JSON.stringify(recordToSave),
      });

      if (!res.ok) throw new Error("保存失敗");

      toast({
        title: "学習停止",
        description: `${durationHours.toFixed(2)} 時間が記録されました`,
      });

      setIsLearning(false);
      setStartTime(null);
      fetchLearningRecords();
      localStorage.removeItem("learning_start_time");
    } catch (err) {
      console.error("保存エラー:", err);
      toast({
        title: "保存エラー",
        description: "学習記録の保存に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [title, category, newCategory, content, fetchLearningRecords, isSaving]);

  const handleReset = useCallback(() => {
    setIsLearning(false);
    setStartTime(null);
    setTitle("");
    setCategory("");
    setNewCategory("");
    setContent("");
    toast({ title: "リセットしました" });
    localStorage.removeItem("learning_start_time");
  }, []);

  const onViewAll = useCallback(() => {
    router.push("/user/learning-history");
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
