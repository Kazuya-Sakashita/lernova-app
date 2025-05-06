import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";
import { authenticateUser } from "@/app/_utils/authenticateUser";
import { subMonths } from "date-fns";
import { Prisma } from "@prisma/client";

// -----------------------------
// POST: 学習記録の新規作成
// -----------------------------
export async function POST(req: NextRequest) {
  // ✅ 認証チェック（失敗した場合はエラーレスポンス）
  const authError = await authenticateUser(req);
  if (authError) return authError;

  try {
    // ✅ リクエストボディのパース
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

    // ✅ 必須フィールドのバリデーション
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

    // ✅ Prisma経由で学習記録を保存
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

    return NextResponse.json(newRecord, { status: 200 });
  } catch (error) {
    console.error("学習記録保存エラー:", error);
    return NextResponse.json(
      { message: "学習記録の保存に失敗しました" },
      { status: 500 }
    );
  }
}

// -----------------------------
// GET: 学習記録の取得
// （例: ?supabaseUserId=xxx&period=3months）
// -----------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabaseUserId = searchParams.get("supabaseUserId");
    const period = searchParams.get("period"); // 期間指定（例: "3months"）

    // ✅ ユーザーIDの存在チェック
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "ユーザーIDが指定されていません" },
        { status: 400 }
      );
    }

    // ✅ フィルター条件の構築
    const today = new Date();
    const where: Prisma.LearningRecordWhereInput = {
      supabaseUserId,
    };

    if (period === "3months") {
      where.learning_date = {
        gte: subMonths(today, 3), // 3ヶ月前～
        lte: today, // 今日まで
      };
    }

    // ✅ Prismaで学習記録を取得（最新順）
    const records = await prisma.learningRecord.findMany({
      where,
      include: {
        category: true, // カテゴリ情報も含める
      },
      orderBy: {
        learning_date: "desc",
      },
    });

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("学習記録取得エラー:", error);
    return NextResponse.json(
      { message: "学習記録の取得に失敗しました" },
      { status: 500 }
    );
  }
}
