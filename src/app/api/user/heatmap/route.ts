// src/app/api/user/heatmap/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import { formatDateJST, getPastNDatesJST } from "../../../_utils/dateHelpers";

const prisma = new PrismaClient();
const DAYS = 90;

// GroupedRecord型: PrismaのgroupBy結果に対応
type GroupedRecord = {
  categoryId: number;
  _sum: {
    duration: number | null;
  };
  learning_date: Date;
};

export async function GET(req: NextRequest) {
  // クエリパラメータからユーザーIDを取得
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // ユーザーIDが指定されていない場合はエラーを返す
  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // 今日の日付と、90日前の日付を取得（UTC）
  const today = new Date();
  const startDate = subDays(today, DAYS - 1);

  // ✅ 過去90日分の学習記録をカテゴリ＆日付単位で集計（PrismaのgroupByを使用）
  const records = await prisma.learningRecord.groupBy({
    by: ["categoryId", "learning_date"],
    where: {
      supabaseUserId,
      learning_date: {
        gte: startDate,
        lte: today,
      },
    },
    _sum: {
      duration: true, // durationの合計を算出
    },
  });

  // 🔢 日付（JST文字列）をキーにして学習時間を合計するMapを初期化
  const totals: Record<string, number> = {};

  // ⏱ JST変換後の "yyyy-MM-dd" をキーにして日別に合計
  records.forEach((record: GroupedRecord) => {
    const dateStr = formatDateJST(record.learning_date);
    totals[dateStr] = (totals[dateStr] ?? 0) + (record._sum.duration ?? 0);
  });

  // 📅 過去90日分の全日付に対して、記録がない日は0時間として補完
  const response = getPastNDatesJST(DAYS, today).map((dateStr) => ({
    date: dateStr,
    hours: totals[dateStr] ?? 0,
  }));

  // 📨 JSON形式でフロントに返却
  return NextResponse.json(response);
}
