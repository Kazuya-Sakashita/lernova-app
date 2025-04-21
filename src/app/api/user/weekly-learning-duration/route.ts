import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  const now = new Date();

  // 今週の期間（今週月曜〜今週日曜）
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // 先週の期間（1週間前の月曜〜1週間前の日曜）
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // 今週分のデータ取得
  const thisWeekRecords = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: { duration: true },
  });

  // 先週分のデータ取得
  const lastWeekRecords = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: {
        gte: lastWeekStart,
        lte: lastWeekEnd,
      },
    },
    select: { duration: true },
  });

  // 合計時間を計算
  const weeklyDuration = thisWeekRecords.reduce(
    (sum, r) => sum + r.duration,
    0
  );
  const lastWeekDuration = lastWeekRecords.reduce(
    (sum, r) => sum + r.duration,
    0
  );

  console.log("This week:", weeklyDuration, "Last week:", lastWeekDuration);

  return NextResponse.json({
    weeklyDuration,
    lastWeekDuration,
  });
}
