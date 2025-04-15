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
import { format } from "date-fns"; // 日付のフォーマットを行うためのライブラリ
import { ja } from "date-fns/locale"; // 日本語ロケールをインポート
import { LearningRecord } from "@/app/_types/formTypes"; // 学習記録の型をインポート
import ActionButton from "@components/ActionButton"; // ActionButtonコンポーネントをインポート

// LearningRecordTablePropsの型定義
interface LearningRecordTableProps {
  records: LearningRecord[]; // 学習記録の配列
  handleDeleteRecord: (id: string) => void; // 削除処理を行う関数
  handleEditRecord: (record: LearningRecord) => void; // 編集処理を行う関数
}

// 時間を日本時間に変換してフォーマットする関数
const formatTimeToJST = (utcDate: string) => {
  console.log("Received UTC Date:", utcDate); // utcDateの値を表示

  // 時間が"00:00"のように日付部分がない場合は、現在の日付を補完してISO形式にする
  if (utcDate.length === 5) {
    const currentDate = new Date();
    const formattedDate = `${
      currentDate.toISOString().split("T")[0]
    }T${utcDate}:00.000Z`; // 現在の日付と時間を結合
    console.log("Formatted Date:", formattedDate); // 変換後の日時を確認
    return new Date(formattedDate).toLocaleString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo", // 日本のタイムゾーンを指定
    }); // 新しいDateオブジェクトを日本時間で表示
  }

  const date = new Date(utcDate); // UTCからDateオブジェクトを作成

  // 日付が無効な場合はエラーメッセージを表示
  if (isNaN(date.getTime())) {
    console.error(`無効な時間: ${utcDate}`);
    return "無効な時間";
  }

  console.log("Converted Date Object:", date); // Dateオブジェクトが有効か確認

  return date.toLocaleString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo", // 日本のタイムゾーンを指定
  }); // 日本時間にフォーマットして、秒を省略
};

const LearningRecordTable: React.FC<LearningRecordTableProps> = ({
  records,
  handleDeleteRecord,
  handleEditRecord,
}) => {
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
          {records.map((record: LearningRecord) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.title}</TableCell>
              <TableCell>
                {record.date instanceof Date &&
                !isNaN(record.date.getTime()) ? (
                  format(record.date, "yyyy/MM/dd", { locale: ja })
                ) : (
                  <span>無効な日付</span>
                )}
              </TableCell>

              <TableCell>
                {formatTimeToJST(record.startTime)} -{" "}
                {formatTimeToJST(record.endTime)}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LearningRecordTable;
