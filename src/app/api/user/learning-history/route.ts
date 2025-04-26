import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma"; // Prisma Clientをインポート
import { authenticateUser } from "@/app/_utils/authenticateUser"; // 認証ミドルウェアをインポート
import { recalculateStreakAfterLearningChange } from "@/app/_utils/learningStreak"; // 継続日数再計算の共通関数をインポート

// ========================================
// POSTリクエスト: 学習記録を新規作成
// ========================================
export async function POST(req: NextRequest) {
  // トークン認証
  const authError = await authenticateUser(req);
  if (authError) {
    return authError; // 認証失敗時はエラーを返す
  }

  try {
    // リクエストボディを取得
    const body = await req.json();
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

    // 必須項目の存在チェック
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

    // Prismaで新しい学習記録を作成
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

    // 📈 継続日数を再計算（共通関数を利用）
    const { currentStreak, bestStreak } =
      await recalculateStreakAfterLearningChange(supabaseUserId);

    console.log("✅ 学習記録が保存され、継続日数も再計算されました:", {
      currentStreak,
      bestStreak,
    });

    // 成功レスポンス
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
// GETリクエスト: 学習記録を取得
// ========================================
export async function GET(req: NextRequest) {
  try {
    // クエリパラメータから supabaseUserId を取得
    const { searchParams } = new URL(req.url);
    const supabaseUserId = searchParams.get("supabaseUserId");

    // supabaseUserId がない場合エラー
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // Prismaで該当ユーザーの学習記録を取得
    const records = await prisma.learningRecord.findMany({
      where: { supabaseUserId },
      include: {
        category: true, // カテゴリー情報も含める
      },
    });

    // 取得成功
    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("学習記録取得エラー:", error);
    return NextResponse.json(
      { message: "学習記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
