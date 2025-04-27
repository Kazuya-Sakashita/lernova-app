import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // クエリパラメータから supabaseUserId を取得
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // ユーザーIDが指定されていない場合は 400 エラーを返す
  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // 現在日付と90日前の開始日を取得（今日を含めて90日分）
  const today = new Date();
  const startDate = subDays(today, 89); // 90日前（今日含む）

  // 指定されたユーザーの過去90日間の学習記録を取得
  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: {
        gte: startDate, // 90日前以降
        lte: today, // 今日まで
      },
    },
    select: {
      learning_date: true, // 学習日
      duration: true, // 学習時間
    },
  });

  // 日別に学習時間を合計するためのマップを初期化
  const totals: Record<string, number> = {};

  // 各レコードの日付をキーとして学習時間を集計
  records.forEach((record) => {
    const dateStr = format(new Date(record.learning_date), "yyyy-MM-dd"); // Date型として処理
    totals[dateStr] = (totals[dateStr] ?? 0) + record.duration;
  });

  // 90日分すべての日付を走査し、学習時間を埋める（なければ0）
  const response = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date: dateStr, // 文字列形式の日付
      hours: totals[dateStr] ?? 0, // 学習時間（なければ 0）
    };
  });

  // JSON形式でレスポンスを返却
  return NextResponse.json(response);
}
