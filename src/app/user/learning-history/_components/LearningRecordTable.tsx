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
import "@components/ActionButton"; // ActionButtonコンポーネントをインポート
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
  // コンソールに取得したrecordsを表示
  console.log("取得した学習記録:", records);

  return (
    <div className="rounded-md border">
      <Table>
        {/* テーブルのヘッダー部分 */}
        <TableHeader>
          <TableRow>
            <TableHead>タイトル</TableHead> {/* タイトル列 */}
            <TableHead>日付</TableHead> {/* 日付列 */}
            <TableHead>時間</TableHead> {/* 時間列 */}
            <TableHead className="hidden md:table-cell">内容</TableHead>{" "}
            {/* 内容列 (PC版でのみ表示) */}
            <TableHead className="text-right">アクション</TableHead>{" "}
            {/* アクション列 (右寄せ) */}
          </TableRow>
        </TableHeader>

        {/* テーブルの本体部分 */}
        <TableBody>
          {/* 各学習記録の行をマッピングして表示 */}
          {records.map((record) => (
            <TableRow key={record.id}>
              {/* タイトルセル - 学習記録のタイトル */}
              <TableCell className="font-medium">{record.title}</TableCell>

              {/* 日付セル - 日付はフォーマットして表示 */}
              <TableCell>
                {/* record.dateが有効な日付かをチェック */}
                {record.date instanceof Date &&
                !isNaN(record.date.getTime()) ? (
                  format(record.date, "yyyy/MM/dd", { locale: ja })
                ) : (
                  <span>無効な日付</span> // 無効な日付の場合は表示しない
                )}
              </TableCell>

              {/* 時間セル - 開始時間と終了時間、そして学習時間 */}
              <TableCell>
                {record.startTime} - {record.endTime}
                <div className="text-xs text-muted-foreground">
                  {record.duration}時間
                </div>
              </TableCell>

              {/* 内容セル - モバイルでは非表示、PC版で表示 */}
              <TableCell className="hidden md:table-cell max-w-xs truncate">
                {record.content}
              </TableCell>

              {/* アクションセル - 編集と削除ボタン */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {/* 編集ボタン：青系 */}
                  <ActionButton
                    onClick={() => handleEditRecord(record)} // 編集ボタンのクリック時にrecordを渡す
                    icon={<Edit className="h-4 w-4" />} // 編集アイコン
                    label="編集" // ボタンのラベル
                    variant="outline" // 編集ボタンにはoutlineスタイル
                  />
                  {/* 削除ボタン：赤系 */}
                  <ActionButton
                    onClick={() => handleDeleteRecord(record.id)} // 削除処理を呼び出す
                    icon={<Trash className="h-4 w-4" />} // 削除アイコン
                    label="削除" // ボタンのラベル
                    variant="destructive" // 削除ボタンにはdestructiveスタイル
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
