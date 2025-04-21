"use client";

import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import Link from "next/link";

const records = [
  {
    days: 1,
    title: "React Hooks",
    duration: 2,
    content: "useEffect と useContext の応用",
  },
  {
    days: 2,
    title: "Next.js ルーティング",
    duration: 1.5,
    content: "動的ルーティングの実装",
  },
  {
    days: 3,
    title: "TypeScript",
    duration: 2.5,
    content: "ジェネリクスとユーティリティ型",
  },
];

const RecentRecords = () => (
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>最近の学習記録</CardTitle>
      <CardDescription>直近の学習活動</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {records.map((record, i) => (
          <div key={i} className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-pink-500 mr-2"></div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{record.title}</p>
              <p className="text-sm text-muted-foreground">
                {record.duration}時間 - {record.content}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {record.days}日前
            </div>
          </div>
        ))}
      </div>
      <Link href="/user/learning-record">
        <Button variant="outline" className="w-full mt-4">
          すべての記録を見る
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export default RecentRecords;
