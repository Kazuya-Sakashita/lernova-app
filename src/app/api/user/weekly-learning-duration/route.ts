import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// 明示的にNode.jsランタイムを指定
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    console.warn("❌ セッション取得失敗:", error?.message);
    return NextResponse.json({ error: "認証されていません" }, { status: 401 });
  }

  const userId = session.user.id;

  // UserテーブルからsupabaseUserIdを取得
  const user = await prisma.user.findUnique({
    where: {
      supabaseUserId: userId,
    },
    select: {
      supabaseUserId: true,
    },
  });

  if (!user?.supabaseUserId) {
    return NextResponse.json(
      { error: "ユーザーが見つかりません" },
      { status: 404 }
    );
  }

  const now = new Date();

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const thisWeekRecords = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId: user.supabaseUserId,
      learning_date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: { duration: true },
  });

  const lastWeekRecords = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId: user.supabaseUserId,
      learning_date: {
        gte: lastWeekStart,
        lte: lastWeekEnd,
      },
    },
    select: { duration: true },
  });

  const weeklyDuration = thisWeekRecords.reduce(
    (sum: number, r: { duration: number }) => sum + r.duration,
    0
  );

  const lastWeekDuration = lastWeekRecords.reduce(
    (sum: number, r: { duration: number }) => sum + r.duration,
    0
  );

  return NextResponse.json({
    weeklyDuration,
    lastWeekDuration,
  });
}
