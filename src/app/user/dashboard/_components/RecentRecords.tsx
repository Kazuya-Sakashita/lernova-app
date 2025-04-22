"use client";

import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@ui/card";
import Link from "next/link";

// APIから取得した学習記録の型
interface LearningRecord {
  id: number;
  title: string;
  duration: number;
  content: string;
  learning_date: string; // ISO形式の日付文字列
  daysAgo: string;
}

// コンポーネントProps
interface RecentRecordsProps {
  records: LearningRecord[];
}

const RecentRecords = ({ records }: RecentRecordsProps) => {
  const today = new Date();
  console.log("today", today);
  console.log("records", records);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>最近の学習記録</CardTitle>
        <CardDescription>直近の学習活動</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => {
            return (
              <div key={record.id} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-pink-500 mr-2" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {record.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {record.duration.toFixed(1)}時間 - {record.content}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {record.daysAgo}
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/user/learning-record">
          <Button variant="outline" className="w-full mt-4">
            すべての記録を見る
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RecentRecords;
