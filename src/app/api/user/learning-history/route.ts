import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma";
import { recalculateStreakAfterLearningChange } from "@/app/_utils/learningStreak";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ========================================
// ✅ セッションから supabaseUserId を取得する共通関数
// ========================================
// Supabaseのセッションに基づいて、ログイン中のユーザーIDを取得
// 認証されていない場合は null を返す
async function getSupabaseUserIdFromSession(): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies }); // クッキー経由でSupabaseクライアント生成
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

// ========================================
// ✅ POSTリクエスト: 学習記録の新規作成処理
// ========================================
export async function POST(req: NextRequest) {
  // 認証チェック
  const supabaseUserId = await getSupabaseUserIdFromSession();
  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "未認証のリクエストです" },
      { status: 401 }
    );
  }

  try {
    // リクエストボディのパース
    const body = await req.json();
    const { categoryId, title, date, startTime, endTime, duration, content } =
      body;

    // 必須項目のバリデーション
    if (
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

    // Prismaを使って新しい学習記録を保存
    const newRecord = await prisma.learningRecord.create({
      data: {
        supabaseUserId,
        categoryId,
        title,
        learning_date: date,
        start_time: startTime,
        end_time: endTime,
        duration,
        content,
      },
    });

    // 学習記録の変更に応じて、継続記録を再計算
    const { currentStreak, bestStreak } =
      await recalculateStreakAfterLearningChange(supabaseUserId);

    // 保存成功レスポンスを返す
    return NextResponse.json(
      { newRecord, currentStreak, bestStreak },
      { status: 200 }
    );
  } catch (error) {
    console.error("学習記録保存エラー:", error);
    return NextResponse.json(
      { message: "学習記録の保存に失敗しました" },
      { status: 500 }
    );
  }
}

// ========================================
// ✅ GETリクエスト: 学習記録の一覧取得処理
// ========================================
export async function GET() {
  // 認証チェック
  const supabaseUserId = await getSupabaseUserIdFromSession();
  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "未認証のリクエストです" },
      { status: 401 }
    );
  }

  try {
    // 指定ユーザーの学習記録を取得（カテゴリ情報も含める）
    const records = await prisma.learningRecord.findMany({
      where: { supabaseUserId },
      include: {
        category: true,
      },
    });

    // 取得成功レスポンスを返す
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("学習記録取得エラー:", error);
    return NextResponse.json(
      { message: "学習記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
