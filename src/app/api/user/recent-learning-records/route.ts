import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

// Prisma クライアントのインスタンスを作成
const prisma = new PrismaClient();

// このファイル専用の学習記録型を定義
type RecentLearningRecord = {
  id: number; // 学習記録のID
  title: string; // 学習記録のタイトル
  content: string; // 学習内容
  duration: number; // 学習時間
  learning_date: Date; // 学習日
  daysAgo: string; // 何日前かの表示
};

export async function GET(req: NextRequest) {
  // クエリパラメータから supabaseUserId を取得
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // supabaseUserId が指定されていない場合はエラーレスポンスを返す
  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // 該当ユーザーの学習記録を取得（最新順に最大7件）
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

  // 学習記録を整形
  const formatted: RecentLearningRecord[] = records.map(
    (record): RecentLearningRecord => ({
      id: record.id,
      title: record.title,
      content: record.content,
      duration: record.duration,
      learning_date: record.learning_date,
      daysAgo: formatDistanceToNow(record.learning_date, {
        addSuffix: true, // 例: "3日前"
        locale: ja,
      }),
    })
  );

  // 整形したデータを JSON として返す
  return NextResponse.json(formatted);
}
