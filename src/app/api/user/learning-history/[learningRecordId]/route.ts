import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma";
import {
  recalculateStreakAfterLearningChange,
  recalculateBestStreak,
} from "@utils/learningStreak";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { parseLearningRecordId } from "@utils/idValidators";

// ========================================
// ✅ ユーザーID取得（セッションベース）
// ========================================
async function getSupabaseUserId(): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

// ========================================
// ✅ PUT: 学習記録の更新
// ========================================
export const PUT = async (
  request: NextRequest,
  { params }: { params: { learningRecordId: string } }
) => {
  const { learningRecordId } = params;

  try {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "未認証のリクエストです" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, date, startTime, endTime, content, categoryId, duration } =
      body;

    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !content ||
      !categoryId ||
      !duration
    ) {
      return NextResponse.json(
        { message: "リクエストボディのデータが不足しています" },
        { status: 400 }
      );
    }

    const { value: recordId, error: idError } =
      parseLearningRecordId(learningRecordId);
    if (!recordId) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const updatedRecord = await prisma.learningRecord.updateMany({
      where: {
        id: recordId,
        supabaseUserId, // ← ユーザーが自分の記録しか更新できないように
      },
      data: {
        title,
        learning_date: date,
        start_time: startTime,
        end_time: endTime,
        content,
        categoryId: Number(categoryId),
        duration,
      },
    });

    if (updatedRecord.count === 0) {
      return NextResponse.json(
        { message: "対象の学習記録が見つかりません" },
        { status: 404 }
      );
    }

    const { currentStreak, bestStreak } =
      await recalculateStreakAfterLearningChange(supabaseUserId);

    return NextResponse.json(
      { updatedRecord, currentStreak, bestStreak },
      { status: 200 }
    );
  } catch (error) {
    console.error("更新処理エラー:", error);
    return NextResponse.json(
      { message: "学習記録の更新に失敗しました" },
      { status: 500 }
    );
  }
};

// ========================================
// ✅ DELETE: 学習記録の削除
// ========================================
export const DELETE = async (
  request: NextRequest,
  { params }: { params: { learningRecordId: string } }
) => {
  const { learningRecordId } = params;

  try {
    const supabaseUserId = await getSupabaseUserId();
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "未認証のリクエストです" },
        { status: 401 }
      );
    }

    const { value: recordId, error: idError } =
      parseLearningRecordId(learningRecordId);
    if (!recordId) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const deletedRecord = await prisma.learningRecord.deleteMany({
      where: {
        id: recordId,
        supabaseUserId, // ← ユーザーが自分の記録しか削除できないように
      },
    });

    if (deletedRecord.count === 0) {
      return NextResponse.json(
        { message: "対象の学習記録が見つかりません" },
        { status: 404 }
      );
    }

    const bestStreak = await recalculateBestStreak(supabaseUserId);

    return NextResponse.json({ deletedRecord, bestStreak }, { status: 200 });
  } catch (error) {
    console.error("削除処理エラー:", error);
    return NextResponse.json(
      { message: "学習記録の削除に失敗しました" },
      { status: 500 }
    );
  }
};
