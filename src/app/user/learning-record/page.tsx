"use client";

import React from "react";

import { useState } from "react";
import { format, addWeeks, startOfWeek, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@ui/card";
import { Button } from "@ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";

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

// 学習記録追加ダイアログコンポーネント
interface AddRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void;
}

function AddRecordDialog({ onAddRecord }: AddRecordDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    // 時間の差分を計算
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}時間${minutes.toString().padStart(2, "0")}分`;

    const newRecord: LearningRecord = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      content,
    };

    onAddRecord(newRecord);
    setOpen(false);
    setTitle("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-500 hover:bg-pink-600">
          学習記録を追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>学習記録を追加</DialogTitle>
          <DialogDescription>
            新しい学習記録を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              日付
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              開始時間
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              終了時間
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              内容
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-pink-500 hover:bg-pink-600"
          >
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LearningHistory() {
  const [records, setRecords] = useState<LearningRecord[]>(initialRecords);

  // 学習記録の追加
  const handleAddRecord = (record: LearningRecord) => {
    setRecords([record, ...records]);
  };

  // 学習記録の削除
  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  // 学習カレンダーのデータ生成
  const generateCalendarData = () => {
    const today = new Date();
    const startDate = startOfWeek(addWeeks(today, -12), { weekStartsOn: 1 }); // 12週間前から

    // 週ごとのデータを生成
    const weeks = [];
    let currentDate = startDate;

    for (let i = 0; i < 14; i++) {
      // 14週間分（約3ヶ月）
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = addDays(currentDate, j);
        // この日の学習記録があるかチェック
        const hasRecord = records.some(
          (record) =>
            date.getFullYear() === record.date.getFullYear() &&
            date.getMonth() === record.date.getMonth() &&
            date.getDate() === record.date.getDate()
        );

        week.push({
          date,
          hasRecord,
        });
      }
      weeks.push({
        weekStart: currentDate,
        days: week,
      });
      currentDate = addDays(currentDate, 7);
    }

    // 左右のカレンダーに分割
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
            {/* 左側のカレンダー */}
            <div className="flex-1">
              <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
                <div className="h-6" /> {/* 空白セル */}
                {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
                  <div
                    key={i}
                    className="h-6 text-xs text-gray-500 text-center"
                  >
                    {day}
                  </div>
                ))}
                {leftCalendar.map((week, weekIndex) => (
                  <React.Fragment key={`left-${weekIndex}`}>
                    <div className="text-xs text-gray-500 pr-2 text-right">
                      {format(week.weekStart, "M/d", { locale: ja })}
                    </div>
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={`left-${weekIndex}-${dayIndex}`}
                        className={`aspect-square ${
                          day.hasRecord ? "bg-pink-300" : "bg-gray-100"
                        } rounded-sm transition-colors duration-200 hover:opacity-80`}
                        title={format(day.date, "yyyy/MM/dd")}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 右側のカレンダー */}
            <div className="flex-1">
              <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
                <div className="h-6" /> {/* 空白セル */}
                {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
                  <div
                    key={i}
                    className="h-6 text-xs text-gray-500 text-center"
                  >
                    {day}
                  </div>
                ))}
                {rightCalendar.map((week, weekIndex) => (
                  <React.Fragment key={`right-${weekIndex}`}>
                    <div className="text-xs text-gray-500 pr-2 text-right">
                      {format(week.weekStart, "M/d", { locale: ja })}
                    </div>
                    {week.days.map((day, dayIndex) => (
                      <div
                        key={`right-${weekIndex}-${dayIndex}`}
                        className={`aspect-square ${
                          day.hasRecord ? "bg-pink-300" : "bg-gray-100"
                        } rounded-sm transition-colors duration-200 hover:opacity-80`}
                        title={format(day.date, "yyyy/MM/dd")}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">学習記録一覧</h2>
        <AddRecordDialog onAddRecord={handleAddRecord} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>時間</TableHead>
              <TableHead className="hidden md:table-cell">内容</TableHead>
              <TableHead className="text-right">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.title}</TableCell>
                <TableCell>
                  {format(record.date, "yyyy/MM/dd", { locale: ja })}
                </TableCell>
                <TableCell>
                  {record.startTime} - {record.endTime}
                  <div className="text-xs text-muted-foreground">
                    {record.duration}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate">
                  {record.content}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">
                        編集
                      </span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">
                        削除
                      </span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
