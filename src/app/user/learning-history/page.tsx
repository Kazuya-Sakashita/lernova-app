// src/app/user/learning-history/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import AddRecordDialog from "./_components/AddRecordDialog";
import Calendar from "./_components/Calendar";
import LearningRecordTable from "./_components/LearningRecordTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { LearningRecord } from "@/app/_types/formTypes";
import { useSession } from "@utils/session"; // セッション情報を取得

// 生データの型を定義
interface RawRecord {
  id: string;
  supabaseUserId: string;
  category: {
    id: number;
    category_name: string;
  };
  title: string;
  learning_date: string; // ISO日付文字列
  start_time: string; // ISO日付文字列
  end_time: string; // ISO日付文字列
  duration: number;
  content: string;
}

const LearningHistory = () => {
  const [records, setRecords] = useState<LearningRecord[]>([]); // 学習記録を格納するステート
  const { user } = useSession(); // 現在のユーザーのセッション情報を取得

  // 学習記録データを変換する関数
  const transformRecord = (rawRecord: RawRecord): LearningRecord => {
    return {
      id: rawRecord.id, // idをstring型に変換
      supabaseUserId: rawRecord.supabaseUserId,
      categoryId: rawRecord.category.id, // カテゴリーIDを取得
      title: rawRecord.title, // タイトルを取得
      date: new Date(rawRecord.learning_date), // learning_dateをDate型に変換
      startTime: rawRecord.start_time.split("T")[1].substring(0, 5), // 時間部分をHH:mm形式に変換
      endTime: rawRecord.end_time.split("T")[1].substring(0, 5), // 時間部分をHH:mm形式に変換
      duration: rawRecord.duration, // durationはそのまま使用
      content: rawRecord.content,
    };
  };

  // `supabaseUserId`に基づいてLearningRecordをフェッチする関数
  const fetchLearningRecords = useCallback(async () => {
    if (!user?.id) {
      console.error("ユーザーIDが見つかりません");
      return;
    }

    try {
      const response = await fetch(
        `/api/user/learning-history?supabaseUserId=${user.id}`
      );

      console.log("Fetch Learning Records Response:", response); // レスポンスのデバッグ用ログ
      if (!response.ok) {
        throw new Error("学習記録の取得に失敗しました");
      }

      const data: RawRecord[] = await response.json();

      // データを変換してステートにセット
      const transformedRecords = data.map((rawRecord) =>
        transformRecord(rawRecord)
      );
      setRecords(transformedRecords); // 変換後のデータをステートにセット
    } catch (error) {
      console.error("学習記録の取得エラー:", error);
      alert("学習記録の取得に失敗しました");
    }
  }, [user?.id]);

  useEffect(() => {
    // ユーザー情報が存在する場合のみfetchLearningRecordsを実行
    if (user?.id) {
      fetchLearningRecords();
    } else {
      console.log("ユーザー情報がまだ取得されていません");
    }
  }, [user?.id, fetchLearningRecords]); // user?.idが変わるたびに再実行// fetchLearningRecords関数が変更されたときに実行されるようにする

  const handleAddRecord = (record: LearningRecord) => {
    setRecords([record, ...records]); // 新しいレコードを配列の先頭に追加
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id)); // 指定されたIDのレコードを削除
  };

  // 編集機能（未実装）
  const handleEditRecord = (record: LearningRecord) => {
    console.log("Editing record with id:", record.id);
    // 編集処理をここに追加する
  };

  const generateCalendarData = () => {
    const today = new Date(); // 現在の日付を取得
    const weeks: {
      weekStart: Date;
      days: { date: Date; hasRecord: boolean }[];
    }[] = [];
    const currentDate = today;

    // 2週間分のデータを生成
    for (let i = 0; i < 14; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(currentDate);
        const hasRecord = records.some((record) => {
          if (record.date) {
            return (
              date.getFullYear() === record.date.getFullYear() &&
              date.getMonth() === record.date.getMonth() &&
              date.getDate() === record.date.getDate()
            );
          }
          return false; // record.dateが無効な場合はfalseを返す
        });
        week.push({ date, hasRecord });
        currentDate.setDate(currentDate.getDate() + 1); // 日付を1日進める
      }
      weeks.push({ weekStart: currentDate, days: week });
    }

    // 左右にカレンダーを分割
    const leftCalendar = weeks.slice(0, 7); // 左側のカレンダー（1週間分）
    const rightCalendar = weeks.slice(7, 14); // 右側のカレンダー（残りの1週間分）

    return { leftCalendar, rightCalendar };
  };

  const { leftCalendar, rightCalendar } = generateCalendarData(); // カレンダー用データを取得

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習履歴</h1>

      <Card>
        <CardHeader>
          <CardTitle>学習進捗</CardTitle>
          <CardDescription>過去の学習時間</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <Calendar calendarData={leftCalendar} />
            <Calendar calendarData={rightCalendar} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">学習記録一覧</h2>
        <AddRecordDialog onAddRecord={handleAddRecord} />
      </div>

      <LearningRecordTable
        records={records}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleEditRecord} // 編集機能を渡す
      />
    </div>
  );
};

export default LearningHistory;
