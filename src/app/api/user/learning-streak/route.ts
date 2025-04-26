import { NextRequest, NextResponse } from "next/server";
import {
  calculateStreak,
  getLearningDates,
  saveOrUpdateBestStreak,
} from "@utils/learningStreak";

export async function GET(req: NextRequest) {
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  const dates = await getLearningDates(supabaseUserId);
  const streak = calculateStreak(dates);
  const bestStreak = await saveOrUpdateBestStreak(supabaseUserId, streak);

  return NextResponse.json({ streak, bestStreak });
}
