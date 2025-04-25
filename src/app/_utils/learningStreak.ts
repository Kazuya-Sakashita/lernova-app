import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

// 日付のセットから連続日数を計算
export function calculateStreak(dates: Set<string>, today = new Date()) {
  let streak = 0;
  const current = new Date(today);

  for (let i = 0; i < 90; i++) {
    const dateStr = format(current, "yyyy-MM-dd");
    if (dates.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// supabaseUserIdから学習記録を取得
export async function getLearningDates(supabaseUserId: string) {
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
    select: { learning_date: true },
  });

  return new Set(records.map((r) => format(r.learning_date, "yyyy-MM-dd")));
}

// ベスト streak の保存 or 更新
export async function saveOrUpdateBestStreak(
  supabaseUserId: string,
  currentStreak: number
) {
  const existing = await prisma.streak.findUnique({
    where: { supabaseUserId },
  });

  if (!existing) {
    await prisma.streak.create({
      data: {
        supabaseUserId,
        best_streak: currentStreak,
      },
    });
    return currentStreak;
  }

  if (currentStreak > existing.best_streak) {
    await prisma.streak.update({
      where: { supabaseUserId },
      data: { best_streak: currentStreak },
    });
    return currentStreak;
  }

  return existing.best_streak;
}
