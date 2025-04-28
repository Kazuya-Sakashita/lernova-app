"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@ui/table"; // UIコンポーネントのインポート
import { Edit, Trash } from "lucide-react"; // 編集と削除アイコンのインポート
import { LearningRecord } from "@/app/_types/formTypes"; // 学習記録の型をインポート
import ActionButton from "@components/ActionButton"; // ActionButtonコンポーネントをインポート
import { extractTime } from "@utils/timeUtils"; // timeUtils.tsからconvertToJSTをインポート

// LearningRecordTablePropsの型定義
interface LearningRecordTableProps {
  records: LearningRecord[]; // 学習記録の配列
  handleDeleteRecord: (id: string) => void; // 削除処理を行う関数
  handleEditRecord: (record: LearningRecord) => void; // 編集処理を行う関数
}

const LearningRecordTable: React.FC<LearningRecordTableProps> = ({
  records,
  handleDeleteRecord,
  handleEditRecord,
}) => {
  const formatDateToYMD = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // recordsの変更を検知して開始時間でソートを行う
  const sortedRecords = [...records].sort((a, b) => {
    // 現在の時刻を取得
    const now = new Date();

    // aとbの開始時間をDate型に変換
    const startTimeA = new Date(a.startTime).getTime();
    const startTimeB = new Date(b.startTime).getTime();

    // 現在の時刻との差を計算
    const diffA = Math.abs(now.getTime() - startTimeA);
    const diffB = Math.abs(now.getTime() - startTimeB);

    // 現在に近い順に並べる
    const result = diffA - diffB; // 小さいほど現在に近い

    return result;
  });

  return (
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
          {sortedRecords.map((record: LearningRecord) => {
            // console.log("一覧表示map後record:", record); // デバッグ用
            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.title}</TableCell>
                <TableCell>
                  {record.date instanceof Date &&
                  !isNaN(record.date.getTime()) ? (
                    formatDateToYMD(record.date) // 日付部分だけ表示
                  ) : (
                    <span>無効な日付</span>
                  )}
                </TableCell>

                <TableCell>
                  {/* startTimeとendTimeを日本時間に変換して表示 */}
                  {extractTime(record.startTime)} -{" "}
                  {extractTime(record.endTime)}
                  <div className="text-xs text-muted-foreground">
                    {record.duration}時間
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell max-w-xs truncate">
                  {record.content}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ActionButton
                      onClick={() => handleEditRecord(record)}
                      icon={<Edit className="h-4 w-4" />}
                      label="編集"
                      variant="outline"
                    />
                    <ActionButton
                      onClick={() => handleDeleteRecord(record.id)}
                      icon={<Trash className="h-4 w-4" />}
                      label="削除"
                      variant="destructive"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LearningRecordTable;
