"use client";

import React, { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { mutate } from "swr";
import LearningRecordDialog from "./_components/LearningRecordDialog";
import LearningRecordTable from "./_components/LearningRecordTable";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import { LearningRecord, RawRecord } from "@/app/_types/formTypes";
import { useSession } from "@utils/session";
import { fetcher } from "@utils/fetcher";

const LearningHistory = () => {
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [recordToEdit, setRecordToEdit] = useState<LearningRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useSession();
  const userId = user?.supabaseUserId ?? "";

  // ✅ ヒートマップデータ取得
  const { data: heatmapData } = useSWR(
    userId ? `/api/user/heatmap?supabaseUserId=${userId}` : null,
    fetcher
  );

  // ヒートマップ更新関数を作成
  const refreshHeatmap = () => {
    if (user?.supabaseUserId) {
      console.log("ヒートマップのデータを更新");
      mutate(`/api/user/heatmap?supabaseUserId=${user.supabaseUserId}`);
    }
  };

  // 学習記録を変換する関数
  const transformRecord = (rawRecord: RawRecord): LearningRecord => ({
    id: rawRecord.id,
    supabaseUserId: rawRecord.supabaseUserId,
    categoryId: rawRecord.category.id,
    title: rawRecord.title,
    date: new Date(rawRecord.learning_date),
    startTime: rawRecord.start_time,
    endTime: rawRecord.end_time,
    duration: rawRecord.duration,
    content: rawRecord.content,
  });

  // 学習記録をフェッチする関数
  const fetchLearningRecords = useCallback(async () => {
    if (!user?.id) return console.error("ユーザーIDが見つかりません");

    try {
      const response = await fetch(
        `/api/user/learning-history?supabaseUserId=${user.id}`
      );
      const data: RawRecord[] = await response.json();
      const transformedRecords = data
        .map(transformRecord)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecords(transformedRecords);
    } catch (error) {
      console.error("学習記録の取得エラー:", error);
      alert("学習記録の取得に失敗しました");
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchLearningRecords();
  }, [user?.id, fetchLearningRecords]);

  // 学習記録追加
  const handleAddRecord = async (newRecord: LearningRecord) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/user/learning-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) throw new Error("学習記録の保存に失敗しました");

      await fetchLearningRecords();
      refreshHeatmap();
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
    setIsSaving(false);
  };

  // 学習記録削除
  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("本当にこの学習記録を削除しますか？")) return;

    try {
      const response = await fetch(`/api/user/learning-history/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) throw new Error("学習記録の削除に失敗しました");

      setRecords(records.filter((record) => record.id !== id));
      refreshHeatmap();
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };

  // 学習記録編集
  const handleEditRecord = (record: LearningRecord) => {
    setRecordToEdit(record);
  };

  const handleSaveRecord = async (updatedRecord: LearningRecord) => {
    setIsSaving(true);

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

      if (!response.ok) throw new Error("学習記録の更新に失敗しました");

      setRecords((prev) =>
        prev.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );
      setRecordToEdit(null);
      refreshHeatmap();
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習履歴</h1>

      {/* ✅ 学習進捗カード（Heatmapに差し替え） */}

      <HeatmapSection data={heatmapData ?? []} />

      {/* 学習記録追加と一覧 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">学習記録一覧</h2>
        <LearningRecordDialog
          onAddRecord={handleAddRecord}
          onSaveRecord={handleSaveRecord}
          recordToEdit={recordToEdit}
          isEditing={recordToEdit !== null}
          setRecordToEdit={setRecordToEdit}
          isSaving={isSaving}
        />
      </div>

      <LearningRecordTable
        records={records}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleEditRecord}
      />
    </div>
  );
};

export default LearningHistory;
