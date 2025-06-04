import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// -----------------------------
// ✅ GET: 今週の学習時間（曜日別集計）
// -----------------------------
export async function GET() {
  // ✅ Supabaseクライアントからセッション経由でユーザー情報を取得
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ 未認証ユーザーの場合は 401 を返す
  if (!user) {
    console.warn("⚠️ 未認証アクセスがありました");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = user.id;

  // ✅ 今週の開始（月曜）と終了（日曜）を計算
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  console.log("📆 今週の期間:", {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(weekEnd, "yyyy-MM-dd"),
  });

  // ✅ 各日付（yyyy-MM-dd）の文字列配列を生成
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(
    (date) => format(date, "yyyy-MM-dd")
  );

  // ✅ ユーザーの今週の学習記録を取得（必要なフィールドのみ）
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

  // ✅ 日別の合計時間を初期化（すべて0）
  const dailyTotals: Record<string, number> = {};
  for (const day of days) {
    dailyTotals[day] = 0;
  }

  // ✅ 各記録を対応する日付に加算
  for (const record of records) {
    const dateStr = format(record.learning_date, "yyyy-MM-dd");
    dailyTotals[dateStr] += record.duration;
  }

  console.log("📊 日別の合計時間:", dailyTotals);

  // ✅ レスポンスデータの整形（曜日ラベルと合計時間配列）
  const response = {
    labels: ["月", "火", "水", "木", "金", "土", "日"], // 曜日順固定
    data: days.map((date) => dailyTotals[date] ?? 0),
  };

  console.log("✅ 返却データ:", response);

  // ✅ レスポンスを返す
  return NextResponse.json(response);
}
