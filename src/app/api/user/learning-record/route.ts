import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { subMonths } from "date-fns";
import { Prisma } from "@prisma/client";

// -----------------------------
// ✅ POST: 学習記録の新規作成
// -----------------------------
export async function POST(req: NextRequest) {
  try {
    // ✅ Supabaseクライアントを初期化して、クッキーからセッション取得
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "未認証のリクエストです" },
        { status: 401 }
      );
    }

    const supabaseUserId = user.id;

    // ✅ リクエストボディのパース
    const body = await req.json();
    const { categoryId, title, date, startTime, endTime, duration, content } =
      body;

    // ✅ 必須フィールドのバリデーション
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
// ✅ GET: 学習記録の取得（例: ?period=3months）
// -----------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period"); // 期間指定（例: "3months"）

    // ✅ Supabaseクライアントからセッションを取得
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "未認証のリクエストです" },
        { status: 401 }
      );
    }

    const supabaseUserId = user.id;

    // ✅ フィルター条件の構築（期間あり/なし）
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
