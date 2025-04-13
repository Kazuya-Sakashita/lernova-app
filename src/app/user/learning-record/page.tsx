"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { PlayCircle, StopCircle, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@ui/badge";
import { toast } from "@ui/use-toast";
import { Clock } from "lucide-react";
import { ja } from "date-fns/locale";
import { Toaster } from "@ui/toaster";
import { useSession } from "@utils/session"; // セッション情報を取得

// 学習カテゴリの定義
const CATEGORIES = [
  "プログラミング",
  "数学",
  "語学",
  "科学",
  "歴史",
  "ビジネス",
  "デザイン",
  "その他",
];

// ローカルストレージのキー
const STORAGE_KEY = "lernova_learning_records";

interface LearningRecord {
  id: string;
  title: string;
  category: string;
  startTime: Date;
  endTime: Date;
  content: string;
}

export default function TimeInput() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [title, setTitle] = useState("");
  const [isLearning, setIsLearning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [content, setContent] = useState("");
  const [recentLearning, setRecentLearning] = useState<Array<LearningRecord>>(
    []
  );
  const { user } = useSession(); // ユーザー情報

  // ローカルストレージから最近の学習記録を読み込む
  useEffect(() => {
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords) {
      try {
        // 日付文字列をDate型に変換
        const parsedRecords = JSON.parse(savedRecords).map(
          (record: LearningRecord) => ({
            ...record,
            startTime: new Date(record.startTime),
            endTime: new Date(record.endTime),
          })
        );
        // 最新の5件を取得
        setRecentLearning(parsedRecords.slice(0, 5));
      } catch (error) {
        console.error("Failed to parse saved records:", error);
      }
    }
  }, []);

  // タイマー処理
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLearning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLearning, startTime]);

  const handleStart = () => {
    if (!title) {
      toast({
        title: "タイトルが必要です",
        description: "学習内容のタイトルを入力してください",
        variant: "destructive",
      });
      return;
    }

    if (!category && !newCategory) {
      toast({
        title: "カテゴリが必要です",
        description: "学習カテゴリを選択または入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsLearning(true);
    const start = new Date();
    setStartTime(start); // スタート時間を保存
    localStorage.setItem("learning_start_time", start.toISOString()); // ローカルストレージに保存
    toast({
      title: "学習タイマーを開始しました",
      description: `${title}の学習を記録しています`,
    });
  };

  const handleStop = () => {
    const startTime = localStorage.getItem("learning_start_time");
    if (!startTime) {
      toast({
        title: "開始時間が取得できませんでした",
        description: "学習タイマーが開始されていません。",
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date();
    const duration = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000
    ); // 経過時間（秒）

    const newRecord: LearningRecord = {
      id: Math.random().toString(36).substring(7), // 適当なIDを生成
      title,
      category: category === "その他" ? newCategory : category,
      startTime: startDate,
      endTime: endDate,
      content,
    };

    // ローカルストレージから既存のレコードを取得して、新しいレコードを追加
    const savedRecords = localStorage.getItem(STORAGE_KEY);
    let allRecords: LearningRecord[] = [];

    if (savedRecords) {
      try {
        allRecords = JSON.parse(savedRecords).map((record: LearningRecord) => ({
          ...record,
          startTime: new Date(record.startTime),
          endTime: new Date(record.endTime),
        }));
      } catch (error) {
        console.error("Failed to parse saved records:", error);
      }
    }

    const updatedRecords = [newRecord, ...allRecords];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));

    setRecentLearning([newRecord, ...recentLearning.slice(0, 4)]); // 最近の学習記録を更新

    setElapsedTime(0);
    setStartTime(null);
    setIsLearning(false);
    toast({
      title: "学習タイマーを停止しました",
      description: `${formatTime(duration)}の学習を記録しました`,
    });
  };

  const handleReset = () => {
    if (isLearning) {
      if (
        !window.confirm(
          "学習記録をリセットしますか？現在の記録は保存されません。"
        )
      ) {
        return;
      }
    }

    setIsLearning(false);
    setElapsedTime(0);
    setStartTime(null);
    setTitle("");
    setCategory("");
    setNewCategory("");
    setContent("");

    toast({
      title: "学習記録をリセットしました",
    });
  };

  const handleSave = async () => {
    if (!startTime) {
      toast({
        title: "学習時間が記録されていません",
        description: "先に学習タイマーを開始してください",
        variant: "destructive",
      });
      return;
    }

    const endTime = new Date();
    const selectedCategory = category === "その他" ? newCategory : category;

    const newRecord: LearningRecord = {
      id: Math.random().toString(36).substring(7),
      title,
      category: selectedCategory,
      startTime,
      endTime,
      content,
    };

    // 学習記録をサーバーに保存
    try {
      const response = await fetch("/api/user/learning-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`, // ユーザートークンを送信
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error("学習記録の保存に失敗しました");
      }

      // 保存後に最新の記録を表示
      const savedRecord = await response.json();
      setRecentLearning([savedRecord, ...recentLearning.slice(0, 4)]);

      // フォームをリセット
      setTitle("");
      setCategory("");
      setNewCategory("");
      setContent("");
      setElapsedTime(0);
      setStartTime(null);
      setIsLearning(false);

      toast({
        title: "学習記録を保存しました",
        description: `${formatTime(elapsedTime)}の学習を記録しました`,
      });
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateDuration = (startTime: Date, endTime: Date) => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時間${minutes}分`;
  };
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習内容登録</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {/* 学習情報入力カード */}
          <Card>
            <CardHeader>
              <CardTitle>学習情報</CardTitle>
              <CardDescription>
                学習内容のタイトルとカテゴリを入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  placeholder="学習内容のタイトル"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLearning}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={isLearning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {category === "その他" && (
                <div className="space-y-2">
                  <Label htmlFor="newCategory">新しいカテゴリ</Label>
                  <Input
                    id="newCategory"
                    placeholder="新しいカテゴリを入力"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={isLearning}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* タイマーカード */}
          <Card>
            <CardHeader>
              <CardTitle>学習タイマー</CardTitle>
              <CardDescription>学習時間を記録します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLearning ? (
                <div className="text-center">
                  <div className="text-4xl font-bold mb-4">
                    <Clock className="inline-block mr-2 h-8 w-8 text-pink-500" />
                    {formatTime(elapsedTime)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    開始時間:{" "}
                    {startTime &&
                      format(startTime, "yyyy/MM/dd HH:mm:ss", { locale: ja })}
                  </p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  {startTime ? (
                    <div className="text-2xl font-bold mb-2">
                      {formatTime(elapsedTime)}
                    </div>
                  ) : (
                    <p>タイマーを開始すると学習時間が記録されます</p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {!isLearning && !startTime && (
                  <Button
                    onClick={handleStart}
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                    disabled={!title || (!category && !newCategory)}
                  >
                    <PlayCircle className="mr-2 h-4 w-4" /> スタート
                  </Button>
                )}

                {isLearning && (
                  <Button
                    onClick={handleStop}
                    variant="destructive"
                    className="flex-1"
                  >
                    <StopCircle className="mr-2 h-4 w-4" /> ストップ
                  </Button>
                )}

                {!isLearning && startTime && (
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                  >
                    <Save className="mr-2 h-4 w-4" /> 保存
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> リセット
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 学習内容入力カード */}
          <Card>
            <CardHeader>
              <CardTitle>学習内容</CardTitle>
              <CardDescription>学習した内容を記録してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  placeholder="学習内容を入力（例：プログラミング学習 2時間）"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* 最近の学習内容カード */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>最近の学習記録</CardTitle>
                <CardDescription>直近の学習記録</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/user/1/learning-record`)}
              >
                すべて表示
              </Button>
            </CardHeader>
            <CardContent>
              {recentLearning.length > 0 ? (
                <div className="space-y-4">
                  {recentLearning.map((record, index) => (
                    <div
                      key={index}
                      className="border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{record.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(record.startTime, "yyyy/MM/dd", {
                              locale: ja,
                            })}{" "}
                            ・
                            {calculateDuration(
                              record.startTime,
                              record.endTime
                            )}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-pink-50">
                          {record.category}
                        </Badge>
                      </div>
                      {record.content && (
                        <p className="text-sm mt-1 line-clamp-2">
                          {record.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  最近の学習記録はありません。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function Label({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    >
      {children}
    </label>
  );
}
