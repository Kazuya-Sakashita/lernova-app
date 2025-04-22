import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

// Prisma クライアントのインスタンスを作成
const prisma = new PrismaClient();

// GET リクエストの処理
export async function GET(req: NextRequest) {
  // クエリパラメータから supabaseUserId を取得
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // supabaseUserId が指定されていない場合はエラーレスポンスを返す
  if (!supabaseUserId) {
    console.log("❌ supabaseUserId が提供されていません");
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  console.log("✅ supabaseUserId:", supabaseUserId);

  // 該当ユーザーの学習記録を取得（最新順に最大7件）
  const records = await prisma.learningRecord.findMany({
    where: {
      supabaseUserId,
    },
    orderBy: {
      learning_date: "desc", // 新しい順
    },
    take: 7,
    select: {
      title: true,
      content: true,
      duration: true,
      learning_date: true,
    },
  });

  console.log("📚 取得された学習記録:", records);

  // クライアント用に日数やフォーマットを整形
  const formatted = records.map((record) => ({
    title: record.title,
    content: record.content,
    duration: record.duration,
    daysAgo: formatDistanceToNow(record.learning_date, {
      addSuffix: true, // 「～前」の形式で表示（例: "3日前"）
      locale: ja,
    }),
  }));

  console.log("🪄 フォーマット後:", formatted);

  // 整形したデータを JSON として返す
  return NextResponse.json(formatted);
}
