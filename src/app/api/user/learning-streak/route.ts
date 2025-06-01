import { NextResponse } from "next/server";
import {
  calculateStreak,
  getLearningDates,
  saveOrUpdateBestStreak,
} from "@utils/learningStreak";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// -----------------------------
// ✅ GET: 学習継続記録（streak, bestStreak）
// -----------------------------
export async function GET() {
  // ✅ Supabaseセッションからユーザー情報を取得
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = user.id;

  // ✅ 学習記録日一覧を取得 → streak計算 → ベスト記録更新
  const dates = await getLearningDates(supabaseUserId);
  const streak = calculateStreak(dates);
  const bestStreak = await saveOrUpdateBestStreak(supabaseUserId, streak);

  // ✅ JSONレスポンスを返却
  return NextResponse.json({ streak, bestStreak });
}
