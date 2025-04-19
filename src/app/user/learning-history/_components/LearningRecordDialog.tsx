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
  DialogClose,
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
  setRecordToEdit: React.Dispatch<React.SetStateAction<LearningRecord | null>>; // setRecordToEdit をプロパティとして受け取る
}

const LearningRecordDialog = ({
  onAddRecord,
  onSaveRecord,
  recordToEdit,
  isEditing,
  setRecordToEdit,
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

      setStartTime(extractTime(recordToEdit.startTime)); // 開始時間
      if (recordToEdit.endTime) {
        setEndDate(extractDateFromUTC(recordToEdit.endTime)); // 終了日付
        setEndTime(extractTime(recordToEdit.endTime)); // 終了時間
      }

      setContent(recordToEdit.content);
      setCategoryId(String(recordToEdit.categoryId)); // 編集時にカテゴリをセット

      setOpen(true); // 編集モードでフォームを開く
    } else {
      setOpen(false); // 編集時以外は閉じる
    }
  }, [isEditing, recordToEdit]);

  // ダイアログを閉じる処理
  const handleDialogClose = () => {
    setOpen(false); // ダイアログを閉じる
    setRecordToEdit(null); // 編集対象をリセット
  };

  // フォーム送信時に呼び出す関数
  const handleSubmit = async () => {
    // JSTからUTCに変換して開始日時を作成
    const startDateTime = convertToUTC(date, startTime);
    // JSTからUTCに変換して終了日時を作成
    const endDateTime = convertToUTC(endDate, endTime);

    // 開始時間が終了時間よりも後の場合、エラーメッセージを表示して処理を中止
    if (startDateTime >= endDateTime) {
      alert("終了時間は開始時間より後でなければなりません。");
      return;
    }

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
  const handleDialogCloseCancel = () => {
    setOpen(false); // ダイアログを閉じる
    resetForm(); // フォームのリセット
    setRecordToEdit(null); // 編集対象をリセット
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
          {/* 右上のXアイコン */}
          <DialogClose asChild>
            <Button
              onClick={handleDialogCloseCancel} // 「X」ボタンでキャンセルの動作を実行
              className="text-gray-500 hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x h-4 w-4"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </Button>
          </DialogClose>
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
            onClick={handleDialogCloseCancel}
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
