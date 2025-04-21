import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // クエリパラメータから supabaseUserId を取得
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // ユーザーIDが指定されていない場合は 400 エラーを返す
  if (!supabaseUserId) {
    console.warn("⚠️ supabaseUserId が指定されていません");
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // 現在日付を基準に今週の月曜日～日曜日を取得
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 月曜始まり
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // 日曜終わり

  console.log("📆 今週の期間:", {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(weekEnd, "yyyy-MM-dd"),
  });

  // 対象週の各日付（yyyy-MM-dd形式）を生成
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(
    (date) => format(date, "yyyy-MM-dd")
  );

  // 指定ユーザーの今週の学習記録を取得（学習日と学習時間のみ）
  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      learning_date: true,
      duration: true,
    },
  });

  console.log(`🧾 ${records.length} 件の学習記録を取得しました`);

  // 日別の合計時間を初期化（すべて0でスタート）
  const dailyTotals: Record<string, number> = {};
  for (const day of days) {
    dailyTotals[day] = 0;
  }

  // 各記録の日付ごとに duration を加算
  for (const record of records) {
    const dateStr = format(record.learning_date, "yyyy-MM-dd");
    dailyTotals[dateStr] += record.duration;
  }

  console.log("📊 日別の合計時間:", dailyTotals);

  // レスポンスデータを整形（曜日ラベルと日別合計時間の配列）
  const response = {
    labels: ["月", "火", "水", "木", "金", "土", "日"], // 固定順の曜日ラベル
    data: days.map((date) => dailyTotals[date] ?? 0), // 対応する日付の合計時間
  };

  console.log("✅ 返却データ:", response);

  // JSONレスポンスを返す
  return NextResponse.json(response);
}
