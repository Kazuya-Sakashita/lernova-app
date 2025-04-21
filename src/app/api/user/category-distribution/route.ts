import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const supabaseUserId = req.nextUrl.searchParams.get("supabaseUserId");

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

  records.forEach((record) => {
    const category = categories.find((c) => c.id === record.categoryId);
    if (category) {
      labels.push(category.category_name);
      data.push(record._sum.duration ?? 0);
    }
  });

  return NextResponse.json({ labels, data });
}
