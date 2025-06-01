import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// 学習記録のレスポンス用型定義
type RecentLearningRecord = {
  id: number;
  title: string;
  content: string;
  duration: number;
  learning_date: Date;
  daysAgo: string; // "3日前" のような表現
};

// -----------------------------
// ✅ GET: 最近の学習記録（最大7件）
// -----------------------------
export async function GET() {
  // ✅ セッションからユーザーを取得
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未認証ユーザーの場合はエラーレスポンスを返す
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = user.id;

  try {
    // ✅ 該当ユーザーの学習記録を最新順で最大7件取得
    const records = await prisma.learningRecord.findMany({
      where: {
        supabaseUserId,
      },
      orderBy: {
        learning_date: "desc",
      },
      take: 7,
      select: {
        id: true,
        title: true,
        content: true,
        duration: true,
        learning_date: true,
      },
    });

    // ✅ 日付を「〜前」の形式に整形したレスポンスを作成
    const formatted: RecentLearningRecord[] = records.map((record) => ({
      id: record.id,
      title: record.title,
      content: record.content,
      duration: record.duration,
      learning_date: record.learning_date,
      daysAgo: formatDistanceToNow(record.learning_date, {
        addSuffix: true,
        locale: ja,
      }),
    }));

    // ✅ 整形したデータをJSONとして返却
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ 学習記録の取得に失敗:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
