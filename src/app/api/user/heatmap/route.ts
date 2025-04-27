import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

// GroupedRecord型を定義（categoryIdとdurationの合計を持つ）
type GroupedRecord = {
  categoryId: number;
  _sum: {
    duration: number | null;
  };
  learning_date: Date; // learning_date を追加
};

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

  // 指定されたユーザーの過去90日間の学習記録を集計（groupByを使用）
  const records = await prisma.learningRecord.groupBy({
    by: ["categoryId", "learning_date"],
    where: {
      supabaseUserId,
      learning_date: {
        gte: startDate, // 90日前以降
        lte: today, // 今日まで
      },
    },
    _sum: {
      duration: true, // durationを合計
    },
  });

  // 日別に学習時間を合計するためのマップを初期化
  const totals: Record<string, number> = {};

  // 各レコードの日付をキーとして学習時間を集計
  records.forEach((record: GroupedRecord) => {
    // 学習日付を文字列にフォーマット
    const dateStr = format(record.learning_date, "yyyy-MM-dd");

    // 既に学習時間が存在すればその値を追加、なければ新たにセット
    totals[dateStr] = (totals[dateStr] ?? 0) + (record._sum.duration ?? 0);
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
