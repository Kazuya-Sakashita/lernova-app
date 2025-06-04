// src/app/api/user/heatmap/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import { formatDateJST, getPastNDatesJST } from "../../../_utils/dateHelpers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();
const DAYS = 90; // ヒートマップの表示対象日数

// -----------------------------
// ✅ GET: ヒートマップ用の学習記録データ取得
// -----------------------------
export async function GET() {
  // ✅ Supabaseセッションからログインユーザー情報を取得
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証の場合はエラーを返す
  if (!user) {
    console.warn("⚠️ ユーザーが未認証のため拒否されました");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = user.id;

  // ✅ 今日と90日前の日付を計算（UTC基準）
  const today = new Date();
  const startDate = subDays(today, DAYS - 1);

  // ✅ Prismaの groupBy を使って日付＆カテゴリ単位の学習時間を集計
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
      duration: true,
    },
  });

  // ✅ JSTの日付文字列をキーにした日別合計時間マップを作成
  const totals: Record<string, number> = {};

  for (const record of records) {
    const dateStr = formatDateJST(record.learning_date);
    totals[dateStr] = (totals[dateStr] ?? 0) + (record._sum.duration ?? 0);
  }

  // ✅ 90日分すべての日時データを生成し、該当がない日は0として補完
  const response = getPastNDatesJST(DAYS, today).map((dateStr) => ({
    date: dateStr,
    hours: totals[dateStr] ?? 0,
  }));

  // ✅ 整形したヒートマップデータを返す
  return NextResponse.json(response);
}
