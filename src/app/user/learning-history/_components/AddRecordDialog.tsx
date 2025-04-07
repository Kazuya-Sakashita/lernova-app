import React, { useState } from "react";
import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import FormField from "./FormField";
import { LearningRecord } from "@/app/_types/formTypes";
import { useSession } from "@utils/session"; // SWRで管理されたセッション情報をインポート

interface AddRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void;
}

const AddRecordDialog = ({ onAddRecord }: AddRecordDialogProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null); // カテゴリーID
  const [open, setOpen] = useState(false);

  // カテゴリーのリスト（例）
  const categories = [
    { id: "1", name: "プログラミング" },
    { id: "2", name: "デザイン" },
    { id: "3", name: "マーケティング" },
    // ここに他のカテゴリーを追加
  ];

  const { user } = useSession(); // 現在のユーザーのセッション情報を取得
  const token = user?.token; // tokenをセッションから取得
  console.log("AddRecordDialog-Token:", token); // トークンをコンソールに表示

  const handleSubmit = async () => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours}時間${minutes.toString().padStart(2, "0")}分`;

    const newRecord: LearningRecord = {
      id: Math.random().toString(36).substring(2, 9),
      supabaseUserId: user?.id ?? "", // ユーザーIDを使用
      categoryId: categoryId ?? "", // カテゴリーID
      title,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      content,
    };

    // 送信するリクエストのデータをコンソールに表示
    console.log("Sending new learning record:", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
      },
      body: JSON.stringify(newRecord),
    });

    try {
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

      const data = await response.json();

      // レスポンスデータをコンソールに表示
      console.log("Response Data:", data);

      if (data) {
        console.log("Success:", data); // 成功のレスポンスをログに表示
      }

      onAddRecord(newRecord); // 新しいレコードを追加
      setOpen(false); // ダイアログを閉じる
      setTitle("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setContent("");
      setCategoryId(null); // カテゴリー選択をリセット
    } catch (error) {
      console.error(error);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>学習記録を追加</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* カテゴリー選択フォーム */}
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
                  {category.name}
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
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordDialog;
