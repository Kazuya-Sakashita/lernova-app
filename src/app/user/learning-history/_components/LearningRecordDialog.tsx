"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog"; // Dialogに必要なコンポーネントをインポート
import FormField from "./FormField";
import { LearningRecord, Category } from "@/app/_types/formTypes";
import { useSession } from "@utils/session"; // セッション情報を取得

interface LearningRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void;
  onSaveRecord: (record: LearningRecord) => void;
  recordToEdit: LearningRecord | null;
  isEditing: boolean;
}

const LearningRecordDialog = ({
  onAddRecord,
  onSaveRecord,
  recordToEdit,
  isEditing,
}: LearningRecordDialogProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { user } = useSession();

  // サーバーからカテゴリー情報を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category");
      if (!response.ok) {
        throw new Error("カテゴリーの取得に失敗しました");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("カテゴリー取得エラー:", error);
      alert("カテゴリーの取得に失敗しました");
    }
  };

  // 編集モードでフォームをセット
  useEffect(() => {
    if (isEditing && recordToEdit) {
      setTitle(recordToEdit.title);
      setDate(recordToEdit.date.toISOString().split("T")[0]);
      setStartTime(recordToEdit.startTime);
      setEndTime(recordToEdit.endTime);
      setContent(recordToEdit.content);
      setCategoryId(String(recordToEdit.categoryId));
      setOpen(true);
    }
  }, [isEditing, recordToEdit]);

  // カテゴリー情報の取得
  useEffect(() => {
    fetchCategories();
  }, []);

  // フォーム送信時に呼び出す関数
  const handleSubmit = async () => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const duration = hours + minutes / 60;

    const newRecord: LearningRecord = {
      id: recordToEdit
        ? recordToEdit.id
        : Math.random().toString(36).substring(2, 9),
      supabaseUserId: user?.id ?? "",
      categoryId: categoryId ? parseInt(categoryId) : 0,
      title,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      content,
    };

    try {
      if (isEditing) {
        await onSaveRecord(newRecord); // 編集の場合
      } else {
        await onAddRecord(newRecord); // 新規追加の場合
      }

      setOpen(false);
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setContent("");
      setCategoryId(null);
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-500 hover:bg-pink-600">
          {isEditing ? "学習記録を保存" : "学習記録を追加"}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "学習記録を編集" : "学習記録を追加"}
          </DialogTitle>
        </DialogHeader>
        <div id="dialog-description" className="text-sm text-gray-500">
          {isEditing
            ? "既存の学習記録を編集します。"
            : "新しい学習記録を追加します。"}
        </div>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <label htmlFor="categoryId" className="text-sm font-medium">
              カテゴリー
            </label>
            <select
              id="categoryId"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full border-gray-300 rounded-md p-2"
            >
              <option value="">カテゴリーを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="タイトル"
            id="title"
            value={title}
            onChange={setTitle}
            type="text"
          />
          <FormField
            label="日付"
            id="date"
            value={date}
            onChange={setDate}
            type="date"
          />
          <FormField
            label="開始時間"
            id="startTime"
            value={startTime}
            onChange={setStartTime}
            type="time"
          />
          <FormField
            label="終了時間"
            id="endTime"
            value={endTime}
            onChange={setEndTime}
            type="time"
          />
          <FormField
            label="内容"
            id="content"
            value={content}
            onChange={setContent}
            type="textarea"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-pink-500 hover:bg-pink-600"
          >
            {isEditing ? "保存" : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LearningRecordDialog;
