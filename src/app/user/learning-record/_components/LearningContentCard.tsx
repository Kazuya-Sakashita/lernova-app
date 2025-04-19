"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@ui/card";
import { Textarea } from "@ui/textarea";

interface Props {
  content: string;
  setContent: (v: string) => void;
}

export default function LearningContentCard({ content, setContent }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学習内容</CardTitle>
        <CardDescription>学習した内容を記録してください</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="学習内容を入力（例：プログラミング学習2時間）"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
        />
      </CardContent>
    </Card>
  );
}
