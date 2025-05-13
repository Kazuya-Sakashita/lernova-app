"use client";

import React, { useState } from "react";
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
import Pagination from "@ui/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const totalPages = Math.ceil(records.length / recordsPerPage);

  const formatDateToYMD = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const sortedRecords = [...records].sort((a, b) => {
    const now = new Date();
    const diffA = Math.abs(now.getTime() - new Date(a.startTime).getTime());
    const diffB = Math.abs(now.getTime() - new Date(b.startTime).getTime());
    return diffA - diffB;
  });

  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

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
          {paginatedRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.title}</TableCell>
              <TableCell>
                {record.date instanceof Date &&
                !isNaN(record.date.getTime()) ? (
                  formatDateToYMD(record.date)
                ) : (
                  <span>無効な日付</span>
                )}
              </TableCell>
              <TableCell>
                {extractTime(record.startTime)} - {extractTime(record.endTime)}
                <div className="text-xs text-muted-foreground">
                  {record.duration.toFixed(1)}時間
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

      {/* ページネーション */}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default LearningRecordTable;
