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

interface AddRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void;
}

const AddRecordDialog = ({ onAddRecord }: AddRecordDialogProps) => {
  const [title, setTitle] = useState(""); // 学習記録のタイトル
  const [date, setDate] = useState(""); // 学習記録の日付
  const [startTime, setStartTime] = useState(""); // 学習開始時間
  const [endTime, setEndTime] = useState(""); // 学習終了時間
  const [content, setContent] = useState(""); // 学習内容
  const [categoryId, setCategoryId] = useState<string | null>(null); // カテゴリーID
  const [open, setOpen] = useState(false); // ダイアログの開閉状態
  const [categories, setCategories] = useState<Category[]>([]); // カテゴリーリスト

  const { user } = useSession(); // 現在のユーザーのセッション情報を取得
  const token = user?.token; // セッションからトークンを取得

  // サーバーからカテゴリー情報を取得する関数
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category"); // GETリクエストでカテゴリー情報を取得
      if (!response.ok) {
        throw new Error("カテゴリーの取得に失敗しました");
      }
      const data = await response.json();
      setCategories(data); // 取得したカテゴリーをステートに保存
    } catch (error) {
      console.error("カテゴリー取得エラー:", error); // エラーハンドリング
      alert("カテゴリーの取得に失敗しました");
    }
  };

  // コンポーネントがマウントされたときにカテゴリー情報を取得
  useEffect(() => {
    fetchCategories(); // fetchCategories関数を実行
  }, []);

  // フォームが送信されたときに実行される関数
  const handleSubmit = async () => {
    // 開始時間と終了時間をDateオブジェクトに変換
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    // 時間差を計算して時間と分に分ける
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // durationをFloat型に変換（時間単位）
    const duration = hours + minutes / 60;

    const newRecord: LearningRecord = {
      id: Math.random().toString(36).substring(2, 9), // 新しいIDを生成
      supabaseUserId: user?.id ?? "", // ユーザーID
      categoryId: categoryId ? parseInt(categoryId) : 0, // カテゴリーIDを整数に変換
      title,
      date: new Date(date), // 学習日付
      startTime,
      endTime,
      duration, // 学習時間
      content, // 学習内容
    };

    try {
      // 学習記録をサーバーに送信
      const response = await fetch("/api/user/learning-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error("学習記録の保存に失敗しました");
      }

      // 新しいレコードを状態に追加
      onAddRecord(newRecord); // 親コンポーネントに新しいレコードを追加する関数を呼び出す
      setOpen(false); // ダイアログを閉じる
      setTitle(""); // タイトルをリセット
      setDate(""); // 日付をリセット
      setStartTime(""); // 開始時間をリセット
      setEndTime(""); // 終了時間をリセット
      setContent(""); // 内容をリセット
      setCategoryId(null); // カテゴリー選択をリセット
    } catch (error) {
      console.error(error); // エラーハンドリング
      alert("学習記録の保存に失敗しました");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-pink-500 hover:bg-pink-600">
          学習記録を追加
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="dialog-description" // ダイアログの説明を設定
      >
        <DialogHeader>
          <DialogTitle>学習記録を追加</DialogTitle>
        </DialogHeader>
        {/* ダイアログの説明を追加 */}
        <div id="dialog-description" className="text-sm text-gray-500">
          ここでは、学習記録を入力し、保存することができます。
        </div>
        <div className="grid gap-4 py-4">
          {/* カテゴリー選択フォーム */}
          <div className="space-y-1">
            <label htmlFor="categoryId" className="text-sm font-medium">
              カテゴリー
            </label>
            <select
              id="categoryId"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)} // 選択したカテゴリーIDをステートに保存
              className="h-10 w-full border-gray-300 rounded-md p-2"
            >
              <option value="">カテゴリーを選択</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name} {/* カテゴリー名を表示 */}
                </option>
              ))}
            </select>
          </div>
          {/* 学習記録のその他のフィールド */}
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
            onClick={handleSubmit} // 送信ボタンをクリックした際に学習記録を保存
            className="bg-pink-500 hover:bg-pink-600"
          >
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordDialog;
