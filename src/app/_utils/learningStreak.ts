import { PrismaClient } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

const DAYS_RANGE = 90;

/**
 * 📚 日付を "yyyy-MM-dd" 文字列に変換
 */
function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * 📚 日付の差分（日数）を計算
 */
function getDateDiffInDays(date1: Date, date2: Date): number {
  const diffMs = date1.getTime() - date2.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 📚 与えられた日付セットから「直近の連続学習日数」を計算する
 */
export function calculateStreak(
  dates: Set<string>,
  today = new Date()
): number {
  let streak = 0;
  const current = new Date(today);

  for (let i = 0; i < DAYS_RANGE; i++) {
    const dateStr = formatDate(current);
    if (dates.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * 📚 指定したユーザーの過去90日間の学習記録日付セットを取得
 */
export async function getLearningDates(
  supabaseUserId: string
): Promise<Set<string>> {
  const today = new Date();
  const startDate = subDays(today, DAYS_RANGE - 1);

  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: { gte: startDate, lte: today },
    },
    select: { learning_date: true },
  });

  return new Set(records.map((r) => formatDate(r.learning_date)));
}

/**
 * 📚 ユーザーの全学習記録日付セットを取得（全期間対象）
 */
export async function getAllLearningDates(
  supabaseUserId: string
): Promise<Set<string>> {
  const records = await prisma.learningRecord.findMany({
    where: { supabaseUserId },
    select: { learning_date: true },
    orderBy: { learning_date: "desc" },
  });

  return new Set(records.map((r) => formatDate(r.learning_date)));
}

/**
 * 📚 ベスト連続記録（streak）を保存・更新
 */
export async function saveOrUpdateBestStreak(
  supabaseUserId: string,
  currentStreak: number
): Promise<number> {
  const existing = await prisma.streak.findUnique({
    where: { supabaseUserId },
  });

  if (!existing) {
    await prisma.streak.create({
      data: { supabaseUserId, best_streak: currentStreak },
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

/**
 * 📚 ✅ 学習記録の追加・更新・削除後に「直近の継続日数」を再計算してベストも更新
 */
export async function recalculateStreakAfterLearningChange(
  supabaseUserId: string
): Promise<{ currentStreak: number; bestStreak: number }> {
  const dates = await getLearningDates(supabaseUserId);
  const currentStreak = calculateStreak(dates);
  const bestStreak = await saveOrUpdateBestStreak(
    supabaseUserId,
    currentStreak
  );

  console.log("📈 継続日数を再計算:", { currentStreak, bestStreak });
  return { currentStreak, bestStreak };
}

/**
 * 📚 ✅ 全学習履歴から「本当のベスト連続記録」を再計算して保存
 */
export async function recalculateBestStreak(
  supabaseUserId: string
): Promise<number> {
  const datesSet = await getAllLearningDates(supabaseUserId);
  const sortedDates = Array.from(datesSet).sort((a, b) => (a > b ? -1 : 1));

  let best = 0;
  let streak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr);

    if (prevDate) {
      const diffDays = getDateDiffInDays(prevDate, currentDate);
      if (diffDays === 1) {
        streak++;
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    best = Math.max(best, streak);
    prevDate = currentDate;
  }

  await prisma.streak.upsert({
    where: { supabaseUserId },
    create: { supabaseUserId, best_streak: best },
    update: { best_streak: best },
  });

  console.log("🏆 本当のベスト連続日数を再計算・更新:", best);
  return best;
}
