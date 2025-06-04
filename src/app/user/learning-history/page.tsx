"use client";

import React, { useState } from "react";
import { mutate } from "swr";
import LearningRecordDialog from "./_components/LearningRecordDialog";
import LearningRecordTable from "./_components/LearningRecordTable";
import HeatmapSection from "@/app/user/dashboard/_components/HeatmapSection";
import { LearningRecord } from "@/app/_types/formTypes";
import { useSession } from "@utils/session";
import { fetcher } from "@utils/fetcher";
import useSWR from "swr";
import { useLearningRecords } from "@hooks/useLearningRecords";

const LearningHistory = () => {
  const [recordToEdit, setRecordToEdit] = useState<LearningRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useSession();

  const { records: rawRecords, refreshLearningRecords } = useLearningRecords();

  const { data: heatmapData } = useSWR(
    user ? `/api/user/heatmap` : null,
    fetcher
  );

  const refreshHeatmap = () => {
    if (user) {
      mutate(`/api/user/heatmap`);
    }
  };

  const transformedRecords: LearningRecord[] = (rawRecords ?? []).map((r) => ({
    id: r.id,
    supabaseUserId: r.supabaseUserId,
    categoryId: r.category.id,
    title: r.title,
    date: new Date(r.learning_date),
    startTime: r.start_time,
    endTime: r.end_time,
    duration: r.duration,
    content: r.content,
  }));

  const handleAddRecord = async (newRecord: LearningRecord) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/user/learning-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ クッキーを送信
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) throw new Error("学習記録の保存に失敗しました");

      await refreshLearningRecords();
      refreshHeatmap();
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
    setIsSaving(false);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("本当にこの学習記録を削除しますか？")) return;

    try {
      const response = await fetch(`/api/user/learning-history/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ クッキーを送信
      });

      if (!response.ok) throw new Error("学習記録の削除に失敗しました");

      await refreshLearningRecords();
      refreshHeatmap();
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };

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
          },
          credentials: "include", // ✅ クッキーを送信
          body: JSON.stringify(updatedRecord),
        }
      );

      if (!response.ok) throw new Error("学習記録の更新に失敗しました");

      await refreshLearningRecords();
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

      <HeatmapSection data={heatmapData ?? []} />

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
        records={transformedRecords}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleEditRecord}
      />
    </div>
  );
};

export default LearningHistory;
