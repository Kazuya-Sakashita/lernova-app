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
import {
  extractTime,
  convertToUTC,
  extractDateFromUTC,
} from "@utils/timeUtils"; // 時間変換関数をインポート

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
  const [date, setDate] = useState(""); // 開始日付
  const [endDate, setEndDate] = useState(""); // 終了日付
  const [startTime, setStartTime] = useState(""); // 開始時間
  const [endTime, setEndTime] = useState(""); // 終了時間
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null); // カテゴリID
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
      setCategories(data); // 取得したデータをcategoriesにセット
      console.log("取得したカテゴリー:", data); // 取得したカテゴリデータを確認
    } catch (error) {
      console.error("カテゴリー取得エラー:", error);
      alert("カテゴリーの取得に失敗しました");
    }
  };

  // 編集モードでフォームをセット
  useEffect(() => {
    if (isEditing && recordToEdit) {
      setTitle(recordToEdit.title);
      setDate(extractDateFromUTC(recordToEdit.startTime)); // 開始日付

      // UTCからJSTに変換してフォームに表示
      setStartTime(extractTime(recordToEdit.startTime)); // 開始時間
      if (recordToEdit.endTime) {
        setEndDate(extractDateFromUTC(recordToEdit.endTime)); // 終了日付
        setEndTime(extractTime(recordToEdit.endTime)); // 終了時間
      }

      setContent(recordToEdit.content);
      setCategoryId(String(recordToEdit.categoryId)); // 編集時にカテゴリをセット

      setOpen(true);
    }
  }, [isEditing, recordToEdit]);

  // カテゴリ情報の取得
  useEffect(() => {
    fetchCategories(); // マウント時にカテゴリ情報を取得
  }, []);

  // フォーム送信時に呼び出す関数
  const handleSubmit = async () => {
    // JSTからUTCに変換して開始日時を作成
    const startDateTime = convertToUTC(date, startTime);
    // JSTからUTCに変換して終了日時を作成
    const endDateTime = convertToUTC(endDate, endTime);

    const diffMs =
      new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const duration = hours + minutes / 60;

    const newRecord: LearningRecord = {
      id: recordToEdit
        ? recordToEdit.id
        : Math.random().toString(36).substring(2, 9),
      supabaseUserId: user?.id ?? "",
      categoryId: categoryId ? parseInt(categoryId) : 0, // ここでカテゴリIDを保存
      title,
      date: new Date(date), // 日付はそのまま（集計時に使用するワードとして使用）
      startTime: startDateTime, // UTCで保存
      endTime: endDateTime, // UTCで保存
      duration,
      content,
    };

    try {
      if (isEditing) {
        await onSaveRecord(newRecord); // 編集の場合
      } else {
        await onAddRecord(newRecord); // 新規追加の場合
      }

      setOpen(false); // ダイアログを閉じる
      resetForm(); // フォームのリセット
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  // ダイアログを閉じた時にデータをリセット
  const handleDialogClose = () => {
    setOpen(false); // ダイアログを閉じる
    resetForm(); // フォームのリセット
  };

  // フォームデータをリセットする関数
  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setContent("");
    setCategoryId(null);
  };

  // ダイアログの状態（開閉）によってフォームリセットを行う
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

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
              {categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))
              ) : (
                <option disabled>カテゴリが読み込まれませんでした</option>
              )}
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
            label="開始日付"
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
            label="終了日付"
            id="endDate"
            value={endDate}
            onChange={setEndDate}
            type="date"
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
          <Button
            type="button"
            onClick={handleDialogClose} // ダイアログを閉じる
            className="bg-gray-300 hover:bg-gray-400"
          >
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LearningRecordDialog;
