import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Category } from "@/app/_types/formTypes";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

type GroupedRecord = {
  categoryId: number;
  _sum: {
    duration: number | null;
  };
};

export async function GET() {
  // 🔐 Supabaseユーザーをセッションから取得
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = user.id;

  // 📊 カテゴリごとの学習時間を集計
  const records = await prisma.learningRecord.groupBy({
    by: ["categoryId"],
    where: { supabaseUserId },
    _sum: { duration: true },
  });

  const categories = await prisma.category.findMany();

  const labels: string[] = [];
  const data: number[] = [];

  records.forEach((record: GroupedRecord) => {
    const category = categories.find(
      (c: Category) => c.id === record.categoryId
    );

    if (category !== undefined) {
      labels.push(category.category_name);
      data.push(record._sum.duration ?? 0);
    }
  });

  return NextResponse.json({ labels, data });
}
