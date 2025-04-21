"use client";

import { Button } from "@ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

const DashboardHeader = () => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
      <p className="text-muted-foreground">
        あなたの学習進捗と最新情報を確認しましょう
      </p>
    </div>
    <Link href="/user/learning-record">
      <Button className="bg-pink-500 hover:bg-pink-600">
        <PlusCircle className="mr-2 h-4 w-4" />
        学習を記録
      </Button>
    </Link>
  </div>
);

export default DashboardHeader;
