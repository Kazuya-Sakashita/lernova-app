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
} from "@ui/dialog";
import FormField from "./FormField";
import { LearningRecord, Category } from "@/app/_types/formTypes";
import { useSession } from "@utils/session";
import {
  extractTime,
  convertToUTC,
  extractDateFromUTC,
} from "@utils/timeUtils";

interface LearningRecordDialogProps {
  onAddRecord: (record: LearningRecord) => void;
  onSaveRecord: (record: LearningRecord) => void;
  recordToEdit: LearningRecord | null;
  isEditing: boolean;
  setRecordToEdit: (record: LearningRecord | null) => void;
  isSaving: boolean;
}

const LearningRecordDialog = ({
  onAddRecord,
  onSaveRecord,
  recordToEdit,
  isEditing,
  setRecordToEdit,
  isSaving,
}: LearningRecordDialogProps) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [content, setContent] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { user } = useSession();

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category/hierarchical");
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

  useEffect(() => {
    if (isEditing && recordToEdit) {
      setTitle(recordToEdit.title);
      setDate(extractDateFromUTC(recordToEdit.startTime));
      setStartTime(extractTime(recordToEdit.startTime));
      if (recordToEdit.endTime) {
        setEndDate(extractDateFromUTC(recordToEdit.endTime));
        setEndTime(extractTime(recordToEdit.endTime));
      }
      setContent(recordToEdit.content);
      setCategoryId(String(recordToEdit.categoryId));

      const findParent = (categories: Category[], childId: number): string => {
        for (const cat of categories) {
          if (cat.children?.some((child) => child.id === childId)) {
            return String(cat.id);
          }
        }
        return "";
      };

      const fetchAndSetParent = async () => {
        const res = await fetch("/api/category/hierarchical");
        const data = await res.json();
        setCategories(data);
        const parentId = findParent(data, recordToEdit.categoryId);
        setParentCategoryId(parentId);
      };

      fetchAndSetParent();
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [isEditing, recordToEdit]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    const startDateTime = convertToUTC(date, startTime);
    const endDateTime = convertToUTC(endDate, endTime);

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
      categoryId: categoryId ? parseInt(categoryId) : 0,
      title,
      date: new Date(date),
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      content,
    };

    try {
      if (isEditing) {
        await onSaveRecord(newRecord);
      } else {
        await onAddRecord(newRecord);
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("学習記録の保存に失敗しました");
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    resetForm();
    setRecordToEdit(null);
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setContent("");
    setParentCategoryId("");
    setCategoryId(null);
  };

  const parent = categories.find((cat) => String(cat.id) === parentCategoryId);

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
            <label htmlFor="parentCategoryId" className="text-sm font-medium">
              カテゴリ
            </label>
            <select
              id="parentCategoryId"
              value={parentCategoryId}
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                setCategoryId(null);
              }}
              className="h-10 w-full border-gray-300 rounded-md p-2"
            >
              <option value="">カテゴリを選択</option>
              {categories.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.category_name}
                </option>
              ))}
            </select>
          </div>

          {parent?.children?.length ? (
            <div className="space-y-1">
              <label htmlFor="categoryId" className="text-sm font-medium">
                カテゴリ詳細
              </label>
              <select
                id="categoryId"
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full border-gray-300 rounded-md p-2"
              >
                <option value="">カテゴリ詳細を選択</option>
                {parent.children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.category_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

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
            disabled={isSaving}
          >
            {isSaving
              ? isEditing
                ? "更新中..."
                : "保存中..."
              : isEditing
              ? "更新"
              : "追加"}
          </Button>
          <Button
            type="button"
            onClick={handleDialogClose}
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
