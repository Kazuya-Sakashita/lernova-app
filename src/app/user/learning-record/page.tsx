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
import { useSession } from "@/app/_utils/session";

export default function TimeInputPage() {
  const router = useRouter();
  const { user } = useSession();

  // 入力状態
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [content, setContent] = useState("");

  // タイマー状態
  const [isLearning, setIsLearning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // 保存中かどうか
  const [isSaving, setIsSaving] = useState(false);

  // 最新学習記録
  const [recentLearning, setRecentLearning] = useState<LearningRecord[]>([]);

  // ✅ 初回マウント時に learning_start_time の整合性を確認し、不正なら削除
  useEffect(() => {
    const stored = localStorage.getItem("learning_start_time");
    if (stored) {
      const parsed = new Date(stored);
      if (isNaN(parsed.getTime())) {
        localStorage.removeItem("learning_start_time");
      }
    }
  }, []);

  // ✅ タイマー実行中のナビゲーションガード（リロードや画面移動を防止）
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
        window.history.pushState(null, "", window.location.href); // 強制的に履歴を戻す
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

  // レスポンスデータをフロントエンド用に変換
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

  // ✅ 最新学習記録を取得
  const fetchLearningRecords = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(
        `/api/user/learning-record?supabaseUserId=${user.id}`
      );
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
  }, [user?.id]);

  // ✅ マウント時に学習記録を取得
  useEffect(() => {
    fetchLearningRecords();
  }, [fetchLearningRecords]);

  // ✅ タイマー開始処理
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

  // ✅ タイマー停止＋学習記録保存処理
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
      supabaseUserId: user?.id,
    };

    try {
      const res = await fetch("/api/user/learning-record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(recordToSave),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ 保存失敗:", res.status, errText);
        throw new Error("保存失敗");
      }
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
  }, [
    title,
    category,
    newCategory,
    content,
    user?.id,
    user?.token,
    fetchLearningRecords,
    isSaving,
  ]);

  // ✅ 入力リセット処理
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

  // ✅ 学習履歴ページへ遷移
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
