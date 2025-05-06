import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import { formatDateJST, getDateDiffInDays } from "./dateHelpers"; // JST変換と日数差分

const prisma = new PrismaClient();
const DAYS_RANGE = 90;

// --- Utility Functions ---

/** JST日付に変換された学習日セットを返す */
const toJSTDateSet = (records: { learning_date: Date }[]) =>
  new Set(records.map((r) => formatDateJST(r.learning_date)));

// --- Streak Logic ---

/** JST基準で連続学習日数を計算 */
export function calculateStreak(
  dates: Set<string>,
  today = new Date()
): number {
  let streak = 0;
  const todayStr = formatDateJST(today);
  const yesterdayStr = formatDateJST(subDays(today, 1));

  const current: Date | null = dates.has(todayStr)
    ? new Date(today)
    : dates.has(yesterdayStr)
    ? subDays(today, 1)
    : null;

  while (current && streak < DAYS_RANGE) {
    const key = formatDateJST(current);
    if (!dates.has(key)) break;
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

// --- Fetch Learning Dates ---

/** 過去90日間の学習日（JST） */
export async function getLearningDates(supabaseUserId: string) {
  const today = new Date();
  const start = subDays(today, DAYS_RANGE - 1);

  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
      learning_date: { gte: start, lte: today },
    },
    select: { learning_date: true },
  });

  return toJSTDateSet(records);
}

/** 全学習日（JST） */
export async function getAllLearningDates(supabaseUserId: string) {
  const records = await prisma.learningRecord.findMany({
    where: { supabaseUserId },
    select: { learning_date: true },
    orderBy: { learning_date: "desc" },
  });

  return toJSTDateSet(records);
}

// --- Persistence ---

/** ベスト記録を保存・更新する */
export async function saveOrUpdateBestStreak(
  supabaseUserId: string,
  currentStreak: number
) {
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

// --- Public APIs ---

/** 学習変更後に連続日数とベスト記録を更新 */
export async function recalculateStreakAfterLearningChange(
  supabaseUserId: string
) {
  const dates = await getLearningDates(supabaseUserId);
  const currentStreak = calculateStreak(dates);
  const bestStreak = await saveOrUpdateBestStreak(
    supabaseUserId,
    currentStreak
  );

  console.log("🔥 Streak updated:", { currentStreak, bestStreak });
  return { currentStreak, bestStreak };
}

/** 全履歴からベスト連続記録を再計算し保存 */
export async function recalculateBestStreak(supabaseUserId: string) {
  const dates = await getAllLearningDates(supabaseUserId);
  const sortedDates = Array.from(dates).sort((a, b) => (a > b ? -1 : 1));

  let best = 0;
  let streak = 0;
  let prev: Date | null = null;

  for (const dateStr of sortedDates) {
    const current = new Date(dateStr);
    if (prev && getDateDiffInDays(prev, current) === 1) {
      streak++;
    } else {
      streak = 1;
    }
    best = Math.max(best, streak);
    prev = current;
  }

  await prisma.streak.upsert({
    where: { supabaseUserId },
    create: { supabaseUserId, best_streak: best },
    update: { best_streak: best },
  });

  console.log("🏆 Best streak re-evaluated:", best);
  return best;
}
