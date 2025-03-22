// /src/app/user/learning-record/page.tsx

"use client";

import React, { useState } from "react";
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

// 学習記録の型定義
interface LearningRecord {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: string;
  content: string;
}

// 仮の学習記録データ
const initialRecords: LearningRecord[] = [
  {
    id: "1",
    title: "CSS Grid レイアウト",
    date: new Date("2023-03-18"),
    startTime: "15:00",
    endTime: "17:00",
    duration: "2時間00分",
    content: "複雑なグリッドレイアウトの実装方法",
  },
  {
    id: "2",
    title: "TypeScript 基礎",
    date: new Date("2023-03-17"),
    startTime: "10:00",
    endTime: "12:30",
    duration: "2時間30分",
    content: "型定義とインターフェースについて学習",
  },
  {
    id: "3",
    title: "Next.js ルーティング",
    date: new Date("2023-03-16"),
    startTime: "14:00",
    endTime: "16:30",
    duration: "2時間30分",
    content: "App Router の使い方を理解",
  },
  {
    id: "4",
    title: "React Hooks",
    date: new Date("2023-03-15"),
    startTime: "09:00",
    endTime: "11:00",
    duration: "2時間00分",
    content: "useState と useEffect の基本を学習",
  },
];

const LearningHistory = () => {
  const [records, setRecords] = useState<LearningRecord[]>(initialRecords);

  const handleAddRecord = (record: LearningRecord) => {
    setRecords([record, ...records]); // 新しいレコードを追加
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id)); // レコードを削除
  };

  const generateCalendarData = () => {
    const today = new Date();
    const weeks: {
      weekStart: Date;
      days: { date: Date; hasRecord: boolean }[];
    }[] = [];
    const currentDate = today;

    for (let i = 0; i < 14; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(currentDate);
        const hasRecord = records.some(
          (record) =>
            date.getFullYear() === record.date.getFullYear() &&
            date.getMonth() === record.date.getMonth() &&
            date.getDate() === record.date.getDate()
        );
        week.push({ date, hasRecord });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push({ weekStart: currentDate, days: week });
    }

    // 左右にカレンダーを分割
    const leftCalendar = weeks.slice(0, 7);
    const rightCalendar = weeks.slice(7, 14);

    return { leftCalendar, rightCalendar };
  };

  const { leftCalendar, rightCalendar } = generateCalendarData();

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
      />
    </div>
  );
};

export default LearningHistory;
