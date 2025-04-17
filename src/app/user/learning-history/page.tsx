"use client";

import React, { useState, useEffect, useCallback } from "react";
import LearningRecordDialog from "./_components/LearningRecordDialog";
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
import { RawRecord } from "@/app/_types/formTypes"; // 生データの型をインポート

const LearningHistory = () => {
  // 学習記録を格納するステート（配列形式）
  const [records, setRecords] = useState<LearningRecord[]>([]);
  // 編集する学習記録のステート
  const [recordToEdit, setRecordToEdit] = useState<LearningRecord | null>(null);
  const { user } = useSession(); // ユーザー情報

  // 学習記録データを変換する関数
  const transformRecord = (rawRecord: RawRecord): LearningRecord => {
    return {
      id: rawRecord.id,
      supabaseUserId: rawRecord.supabaseUserId,
      categoryId: rawRecord.category.id,
      title: rawRecord.title,
      date: new Date(rawRecord.learning_date),
      startTime: rawRecord.start_time,
      endTime: rawRecord.end_time,
      duration: rawRecord.duration,
      content: rawRecord.content,
    };
  };

  // 学習記録をフェッチ
  const fetchLearningRecords = useCallback(async () => {
    if (!user?.id) {
      console.error("ユーザーIDが見つかりません");
      return;
    }

    try {
      const response = await fetch(
        `/api/user/learning-history?supabaseUserId=${user.id}`
      );
      const data: RawRecord[] = await response.json();
      const transformedRecords = data.map(transformRecord);
      transformedRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecords(transformedRecords);
    } catch (error) {
      console.error("学習記録の取得エラー:", error);
      alert("学習記録の取得に失敗しました");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLearningRecords();
    } else {
      console.log("ユーザー情報がまだ取得されていません");
    }
  }, [user?.id, fetchLearningRecords]);

  // 新しい学習記録を追加する関数
  // 新しい学習記録を追加する関数
  const handleAddRecord = async (newRecord: LearningRecord) => {
    try {
      const response = await fetch(`/api/user/learning-history`, {
        method: "POST", // 新規作成のためPOSTメソッド
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`, // トークンをヘッダーに追加
        },
        body: JSON.stringify(newRecord), // 新しい学習記録をJSONとして送信
      });

      if (!response.ok) {
        throw new Error("学習記録の保存に失敗しました");
      }

      // サーバーから保存されたレコードを取得
      const savedRecord = await response.json();
      console.log("新規学習記録が保存されました:", savedRecord);

      // 保存されたレコードをstateに追加
      setRecords([savedRecord, ...records]); // 新しいレコードをstateに追加

      // 学習記録一覧を再取得
      fetchLearningRecords();
    } catch (error) {
      console.error("保存処理エラー:", error);
      alert("学習記録の保存に失敗しました");
    }
  };

  // 学習記録を削除する関数
  const handleDeleteRecord = async (id: string) => {
    // 削除確認のアラート
    const confirmDelete = window.confirm("本当にこの学習記録を削除しますか？");

    if (confirmDelete) {
      try {
        const response = await fetch(`/api/user/learning-history/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // トークンをヘッダーに追加
          },
        });

        if (!response.ok) {
          throw new Error("学習記録の削除に失敗しました");
        }

        // 削除成功時、該当レコードをテーブルから削除
        setRecords(records.filter((record) => record.id !== id));
      } catch (error) {
        console.error(error);
        alert("削除に失敗しました");
      }
    }
  };

  // 編集機能（選択された学習記録をフォームにセット）
  const handleEditRecord = (record: LearningRecord) => {
    setRecordToEdit(record);
  };

  // 学習記録の保存処理
  const handleSaveRecord = async (updatedRecord: LearningRecord) => {
    console.log("token", user?.token);
    try {
      const response = await fetch(
        `/api/user/learning-history/${updatedRecord.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(updatedRecord),
        }
      );

      if (!response.ok) {
        throw new Error("学習記録の更新に失敗しました");
      }

      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      setRecordToEdit(null); // 編集モード解除
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  // カレンダー用のデータを生成する関数
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

  // カレンダー用のデータを取得
  const { leftCalendar, rightCalendar } = generateCalendarData();

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <h1 className="text-3xl font-bold">学習履歴</h1>

      {/* 学習進捗カード */}
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

      {/* 学習記録一覧のタイトルと追加ボタン */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">学習記録一覧</h2>
        <LearningRecordDialog
          onAddRecord={handleAddRecord}
          onSaveRecord={handleSaveRecord}
          recordToEdit={recordToEdit}
          isEditing={recordToEdit !== null}
        />
      </div>

      {/* 学習記録を表示するテーブル */}
      <LearningRecordTable
        records={records}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleEditRecord} // 編集機能を渡す
      />
    </div>
  );
};

export default LearningHistory;
