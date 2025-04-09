// src/app/api/category/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma"; // Prisma Clientをインポート

// GETリクエストで全てのカテゴリーを取得
export async function GET() {
  try {
    // Prismaを使ってSupabaseから全てのカテゴリーを取得
    const categories = await prisma.category.findMany({
      select: {
        id: true, // カテゴリーのIDを取得
        category_name: true, // カテゴリーの名前を取得
      },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return NextResponse.json(
      { message: "カテゴリーの取得に失敗しました" },
      { status: 500 }
    );
  }
}
