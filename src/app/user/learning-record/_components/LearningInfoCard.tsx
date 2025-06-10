"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@ui/card";
import { Input } from "@ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@ui/select";

import { Category } from "@/app/_types/formTypes";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  newCategory: string;
  setNewCategory: (v: string) => void;
  isLearning: boolean;
}

export default function LearningInfoCard({
  title,
  setTitle,
  category,
  setCategory,
  newCategory,
  setNewCategory,
  isLearning,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category/hierarchical");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("❌ カテゴリ取得エラー:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>学習情報</CardTitle>
        <CardDescription>
          学習内容のタイトルとカテゴリを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            タイトル
          </label>
          <Input
            id="title"
            placeholder="学習内容のタイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLearning}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            カテゴリ
          </label>
          <Select
            value={category}
            onValueChange={setCategory}
            disabled={isLearning}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent className="max-h-64 overflow-y-auto">
              {categories.map((parent) => (
                <React.Fragment key={parent.id}>
                  <div className="px-3 py-1 text-xs font-bold text-muted-foreground">
                    {parent.category_name}
                  </div>
                  {parent.children?.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      ┗ {child.category_name}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {category === "その他" && (
          <div className="space-y-2">
            <label htmlFor="newCategory" className="text-sm font-medium">
              新しいカテゴリ
            </label>
            <Input
              id="newCategory"
              placeholder="新しいカテゴリを入力"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={isLearning}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
