import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

// GroupedRecord型を定義（categoryIdとdurationの合計を持つ）
type GroupedRecord = {
  categoryId: number;
  _sum: {
    duration: number | null;
  };
};

export async function GET(req: NextRequest) {
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

  // ユーザーIDが提供されていない場合はエラーレスポンス
  if (!supabaseUserId) {
    return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
  }

  // カテゴリごとの学習時間を集計
  const records = await prisma.learningRecord.groupBy({
    by: ["categoryId"],
    where: { supabaseUserId },
    _sum: { duration: true },
  });

  // カテゴリIDごとに名前を取得
  const categories = await prisma.category.findMany();

  const labels: string[] = [];
  const data: number[] = [];

  // 集計結果に基づいてカテゴリ名と学習時間を格納
  records.forEach((record: GroupedRecord) => {
    const category = categories.find(
      (c: Category) => c.id === record.categoryId // Category型を明示的に指定
    );
    if (category) {
      labels.push(category.category_name);
      data.push(record._sum.duration ?? 0); // durationがnullの場合は0を代入
    }
  });

  // レスポンスとしてカテゴリ名とデータを返す
  return NextResponse.json({ labels, data });
}
