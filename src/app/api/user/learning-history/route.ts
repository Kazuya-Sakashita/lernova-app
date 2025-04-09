import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma"; // Prisma Clientをインポート
import { authenticateUser } from "@/app/_utils/authenticateUser"; // 認証ミドルウェアをインポート

// POSTリクエストで学習記録を作成するAPIエンドポイント
export async function POST(req: NextRequest) {
  const authError = await authenticateUser(req);
  if (authError) {
    return authError; // 認証に失敗した場合はエラーを返す
  }

  try {
    const body = await req.json(); // ReadableStreamをJSONとして読み込む
    const {
      supabaseUserId,
      categoryId,
      title,
      date,
      startTime,
      endTime,
      duration,
      content,
    } = body;

    console.log("受け取ったデータ:", body);

    // 必須のフィールドがすべて存在するかを確認
    if (
      !supabaseUserId ||
      !categoryId ||
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !duration ||
      !content
    ) {
      return NextResponse.json(
        { message: "必須のフィールドが不足しています" },
        { status: 400 }
      );
    }

    const newRecord = await prisma.learningRecord.create({
      data: {
        supabaseUserId,
        categoryId,
        title,
        learning_date: new Date(date),
        start_time: new Date(`2000-01-01T${startTime}:00`),
        end_time: new Date(`2000-01-01T${endTime}:00`),
        duration,
        content,
      },
    });

    console.log("学習記録が正常に保存されました:", newRecord);

    return NextResponse.json(newRecord, { status: 200 });
  } catch (error) {
    console.error("学習記録保存エラー:", error);
    return NextResponse.json(
      { message: "学習記録の保存に失敗しました" },
      { status: 500 }
    );
  }
}

// GETリクエストで学習記録を取得するAPIエンドポイント
export async function GET(req: NextRequest) {
  try {
    // URLのクエリパラメータからsupabaseUserIdを取得
    const { searchParams } = new URL(req.url);
    const supabaseUserId = searchParams.get("supabaseUserId");

    // supabaseUserIdが提供されていない場合、エラーレスポンスを返す
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // Prismaを使用して、supabaseUserIdに基づいて学習記録を取得
    const records = await prisma.learningRecord.findMany({
      where: { supabaseUserId }, // supabaseUserIdでフィルター
      include: {
        category: true, // 必要に応じてカテゴリーを含める（任意）
      },
    });

    // 学習記録が存在する場合、レスポンスとして返す
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("学習記録取得エラー:", error);
    return NextResponse.json(
      { message: "学習記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
