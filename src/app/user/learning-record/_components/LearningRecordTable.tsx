"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead,
} from "@ui/table";
import { Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { LearningRecord } from "@/app/_types/formTypes"; // 学習記録の型をインポート
import "@components/ActionButton"; // ActionButtonコンポーネントをインポート
import ActionButton from "@components/ActionButton"; // ActionButtonコンポーネントをインポート

// LearningRecordTableコンポーネントに渡されるpropsの型定義
interface LearningRecordTableProps {
  records: LearningRecord[]; // 学習記録の配列
  handleDeleteRecord: (id: string) => void; // 削除処理を行う関数
}

// 学習記録を表示するテーブルのコンポーネント
const LearningRecordTable: React.FC<LearningRecordTableProps> = ({
  records, // 親コンポーネントから渡された学習記録
  handleDeleteRecord, // 削除用の関数
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        {/* テーブルのヘッダー部分 */}
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead>
            <TableHead>日付</TableHead>
            <TableHead>時間</TableHead>
            <TableHead className="hidden md:table-cell">内容</TableHead>
            <TableHead className="text-right">アクション</TableHead>
          </TableRow>
        </TableHeader>

        {/* テーブルの本体部分 */}
        <TableBody>
          {/* 各学習記録の行をマッピングして表示 */}
          {records.map((record) => (
            <TableRow key={record.id}>
              {/* タイトルセル */}
              <TableCell className="font-medium">{record.title}</TableCell>

              {/* 日付セル - 日付はフォーマットして表示 */}
              <TableCell>
                {format(record.date, "yyyy/MM/dd", { locale: ja })}
              </TableCell>

              {/* 時間セル - 開始時間と終了時間、そして学習時間 */}
              <TableCell>
                {record.startTime} - {record.endTime}
                <div className="text-xs text-muted-foreground">
                  {record.duration}
                </div>
              </TableCell>

              {/* 内容セル - モバイルでは非表示、PC版で表示 */}
              <TableCell className="hidden md:table-cell max-w-xs truncate">
                {record.content}
              </TableCell>

              {/* アクションセル - 編集と削除ボタン */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {/* 編集ボタン */}
                  <ActionButton
                    onClick={() => {}}
                    icon={<Edit className="h-4 w-4" />}
                    label="編集"
                  />
                  {/* 削除ボタン */}
                  <ActionButton
                    onClick={() => handleDeleteRecord(record.id)} // 削除処理を呼び出す
                    icon={<Trash className="h-4 w-4" />}
                    label="削除"
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
