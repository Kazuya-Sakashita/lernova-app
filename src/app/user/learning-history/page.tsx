"use client";

import React, { useState, useEffect, useCallback } from "react";
import LearningRecordDialog from "./_components/LearningRecordDialog"; // 学習記録の追加・編集ダイアログ
import Calendar from "./_components/Calendar"; // カレンダー表示
import LearningRecordTable from "./_components/LearningRecordTable"; // 学習記録の一覧表示
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card"; // UIコンポーネント
import { LearningRecord } from "@/app/_types/formTypes"; // 学習記録型
import { useSession } from "@utils/session"; // セッション情報を取得
import { RawRecord } from "@/app/_types/formTypes"; // 生データの型

const LearningHistory = () => {
  // 学習記録を格納するステート（配列形式）
  const [records, setRecords] = useState<LearningRecord[]>([]);

  // 編集する学習記録のステート
  const [recordToEdit, setRecordToEdit] = useState<LearningRecord | null>(null);

  // セッション情報からユーザー情報を取得
  const { user } = useSession();

  // 学習記録データを変換する関数
  const transformRecord = (rawRecord: RawRecord): LearningRecord => {
    return {
      id: rawRecord.id,
      supabaseUserId: rawRecord.supabaseUserId,
      categoryId: rawRecord.category.id,
      title: rawRecord.title,
      date: new Date(rawRecord.learning_date), // 生データの日付をDateオブジェクトに変換
      startTime: rawRecord.start_time, // 開始時間
      endTime: rawRecord.end_time, // 終了時間
      duration: rawRecord.duration, // 時間
      content: rawRecord.content, // 内容
    };
  };

  // 学習記録をフェッチ
  const fetchLearningRecords = useCallback(async () => {
    if (!user?.id) {
      console.error("ユーザーIDが見つかりません");
      return;
    }

    try {
      // サーバーから学習記録を取得
      const response = await fetch(
        `/api/user/learning-history?supabaseUserId=${user.id}`
      );
      const data: RawRecord[] = await response.json(); // 生データの取得
      const transformedRecords = data.map(transformRecord); // 生データを整形
      transformedRecords.sort((a, b) => b.date.getTime() - a.date.getTime()); // 新しい順に並べ替え
      setRecords(transformedRecords); // stateにセット
    } catch (error) {
      console.error("学習記録の取得エラー:", error);
      alert("学習記録の取得に失敗しました");
    }
  }, [user?.id]);

  // ユーザーIDが存在する場合、学習記録をフェッチ
  useEffect(() => {
    if (user?.id) {
      fetchLearningRecords();
    } else {
      console.log("ユーザー情報がまだ取得されていません");
    }
  }, [user?.id, fetchLearningRecords]);

  // 新しい学習記録を追加する関数
  const handleAddRecord = async (newRecord: LearningRecord) => {
    try {
      const response = await fetch(`/api/user/learning-history`, {
        method: "POST", // 新規作成のためPOSTメソッド
        headers: {
          "Content-Type": "application/json", // JSON形式で送信
          Authorization: `Bearer ${user?.token}`, // ユーザートークンをヘッダーに追加
        },
        body: JSON.stringify(newRecord), // 新しい学習記録をJSONとして送信
      });

      if (!response.ok) {
        throw new Error("学習記録の保存に失敗しました");
      }

      // サーバーから保存されたレコードを取得
      const savedRecord = await response.json();
      console.log("新規学習記録が保存されました:", savedRecord);

      // 学習記録一覧を再取得
      fetchLearningRecords();
    } catch (error) {
      console.error("保存処理エラー:", error);
      alert("学習記録の保存に失敗しました");
    }
  };

  // 学習記録を削除する関数
  const handleDeleteRecord = async (id: string) => {
    const confirmDelete = window.confirm("本当にこの学習記録を削除しますか？");

    if (confirmDelete) {
      try {
        // 削除リクエスト
        const response = await fetch(`/api/user/learning-history/${id}`, {
          method: "DELETE", // DELETEメソッド
          headers: {
            "Content-Type": "application/json", // JSON形式
            Authorization: `Bearer ${user?.token}`, // ユーザートークン
          },
        });

        if (!response.ok) {
          throw new Error("学習記録の削除に失敗しました");
        }

        // 削除成功時、該当レコードをstateから削除
        setRecords(records.filter((record) => record.id !== id));
      } catch (error) {
        console.error(error);
        alert("削除に失敗しました");
      }
    }
  };

  // 編集機能（選択された学習記録をフォームにセット）
  const handleEditRecord = (record: LearningRecord) => {
    setRecordToEdit(record); // 編集するレコードをセット
  };

  // 学習記録の保存処理
  const handleSaveRecord = async (updatedRecord: LearningRecord) => {
    console.log("token", user?.token);
    try {
      const response = await fetch(
        `/api/user/learning-history/${updatedRecord.id}`,
        {
          method: "PUT", // 更新のためPUTメソッド
          headers: {
            "Content-Type": "application/json", // JSON形式
            Authorization: `Bearer ${user?.token}`, // ユーザートークン
          },
          body: JSON.stringify(updatedRecord), // 更新する学習記録を送信
        }
      );

      if (!response.ok) {
        throw new Error("学習記録の更新に失敗しました");
      }

      // 更新したレコードをstateに反映
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      // 編集モードを解除
      setRecordToEdit(null);
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  // カレンダー用のデータを生成する関数
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
        const hasRecord = records.some((record) => {
          if (record.date) {
            return (
              date.getFullYear() === record.date.getFullYear() &&
              date.getMonth() === record.date.getMonth() &&
              date.getDate() === record.date.getDate()
            );
          }
          return false;
        });
        week.push({ date, hasRecord });
        currentDate.setDate(currentDate.getDate() + 1); // 日付を1日進める
      }
      weeks.push({ weekStart: currentDate, days: week });
    }

    const leftCalendar = weeks.slice(0, 7); // 左側のカレンダー（1週間分）
    const rightCalendar = weeks.slice(7, 14); // 右側のカレンダー（残りの1週間分）

    return { leftCalendar, rightCalendar };
  };

  const { leftCalendar, rightCalendar } = generateCalendarData();

  return (
    <div className="space-y-6">
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

      {/* 学習記録追加ボタンと編集ダイアログ */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">学習記録一覧</h2>
        <LearningRecordDialog
          onAddRecord={handleAddRecord}
          onSaveRecord={handleSaveRecord}
          recordToEdit={recordToEdit} // 編集するレコード
          isEditing={recordToEdit !== null} // 編集モードかどうか
          setRecordToEdit={setRecordToEdit} // 編集するレコードをセットする関数
        />
      </div>

      {/* 学習記録のテーブル */}
      <LearningRecordTable
        records={records}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleEditRecord} // 編集機能を渡す
      />
    </div>
  );
};

export default LearningHistory;
