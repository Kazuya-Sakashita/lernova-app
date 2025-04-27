import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Category } from "@/app/_types/formTypes";

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
    // categories.find() 内で 'c' を Category型として明示的に指定
    const category = categories.find(
      (c: Category) => c.id === record.categoryId
    );

    // 型ガードでCategory型であることを確認
    if (category !== undefined) {
      labels.push(category.category_name);
      data.push(record._sum.duration ?? 0); // durationがnullの場合は0を代入
    }
  });

  // レスポンスとしてカテゴリ名とデータを返す
  return NextResponse.json({ labels, data });
}
