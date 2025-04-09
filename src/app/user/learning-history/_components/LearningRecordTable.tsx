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

// LearningRecordTableコンポーネントに渡されるpropsの型定義
interface LearningRecordTableProps {
  records: LearningRecord[]; // 学習記録の配列
  handleDeleteRecord: (id: string) => void; // 削除処理を行う関数
  handleEditRecord: (record: LearningRecord) => void; // 編集処理を行う関数
}

// 学習記録を表示するテーブルのコンポーネント
const LearningRecordTable: React.FC<LearningRecordTableProps> = ({
  records, // 親コンポーネントから渡された学習記録
  handleDeleteRecord, // 削除用の関数
  handleEditRecord, // 編集用の関数
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
          {records.map((record) => (
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
                {record.startTime} - {record.endTime}
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
