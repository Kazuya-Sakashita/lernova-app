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
  const [parentCategoryId, setParentCategoryId] = useState<string>("");

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

  const selectedParent = categories.find(
    (cat) => cat.id.toString() === parentCategoryId
  );

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

        {/* カテゴリ選択 */}
        <div className="space-y-2">
          <label htmlFor="parent-category" className="text-sm font-medium">
            カテゴリ
          </label>
          <Select
            value={parentCategoryId}
            onValueChange={(value) => {
              setParentCategoryId(value);
              setCategory(""); // カテゴリ詳細リセット
            }}
            disabled={isLearning}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((parent) => (
                <SelectItem key={parent.id} value={parent.id.toString()}>
                  {parent.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* カテゴリ詳細選択 */}
        {parentCategoryId && selectedParent?.children?.length ? (
          <div className="space-y-2">
            <label htmlFor="child-category" className="text-sm font-medium">
              カテゴリ詳細
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isLearning}
            >
              <SelectTrigger>
                <SelectValue placeholder="カテゴリ詳細を選択" />
              </SelectTrigger>
              <SelectContent>
                {selectedParent.children.map((child) => (
                  <SelectItem key={child.id} value={child.id.toString()}>
                    {child.category_name}
                  </SelectItem>
                ))}
                <SelectItem value="その他">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

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
