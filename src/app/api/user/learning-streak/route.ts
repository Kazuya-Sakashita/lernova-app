import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

// 🔧 連続日数の計算ロジックを関数化
function getStreakFromRecords(dates: Set<string>) {
  let streak = 0;
  const current = new Date();

  for (let i = 0; i < 90; i++) {
    const dateStr = format(current, "yyyy-MM-dd");

    if (dates.has(dateStr)) {
      streak++;
      console.log(`✅ ${dateStr} は記録あり（連続 ${streak} 日目）`);
      current.setDate(current.getDate() - 1);
    } else {
      console.log(`⛔️ ${dateStr} に記録なし → streak終了`);
      break;
    }
  }

  return streak;
}

export async function GET(req: NextRequest) {
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  console.log("🚀 /api/user/learning-streak にリクエストが来ました");

  // Prisma Client に存在するモデルを表示（streak があるか確認）
  const models = Object.keys(prisma);
  console.log("🧩 Prisma モデル一覧:", models);

  if (!supabaseUserId) {
    console.warn("❌ supabaseUserId がありません");
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // 🔎 対象期間の記録を取得（過去90日）
  const today = new Date();
  const startDate = subDays(today, 89);

  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: {
        gte: startDate,
        lte: today,
      },
    },
    select: {
      learning_date: true,
    },
  });

  const dateSet = new Set(
    records.map((r) => format(r.learning_date, "yyyy-MM-dd"))
  );

  const streak = getStreakFromRecords(dateSet);
  console.log("📈 現在の連続日数:", streak);

  // 📌 現在のベスト記録を確認
  const existing = await prisma.streak.findUnique({
    where: { supabaseUserId },
  });

  // 🔄 ベスト記録の保存 or 更新
  if (!existing) {
    await prisma.streak.create({
      data: {
        supabaseUserId,
        best_streak: streak,
      },
    });
    console.log("🆕 Streak レコードを新規作成");
  } else if (streak > existing.best_streak) {
    await prisma.streak.update({
      where: { supabaseUserId },
      data: { best_streak: streak },
    });
    console.log("🏆 ベスト streak を更新:", streak);
  } else {
    console.log("🟡 ベスト streak に変更なし");
  }

  return NextResponse.json({
    streak,
    bestStreak: Math.max(streak, existing?.best_streak ?? 0),
  });
}
