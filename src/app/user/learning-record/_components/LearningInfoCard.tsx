// src/app/user/learning-record/_components/LearningInfoCard.tsx
"use client";

import React from "react";
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
            <SelectContent>
              {[
                "プログラミング",
                "数学",
                "語学",
                "科学",
                "歴史",
                "ビジネス",
                "デザイン",
                "その他",
              ].map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
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
