import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma";
import {
  recalculateStreakAfterLearningChange,
  recalculateBestStreak,
} from "@utils/learningStreak";
import { getCurrentUser } from "@utils/auth";
import { parseLearningRecordId } from "@utils/idValidators";

// PUT リクエスト: 学習記録の更新
export const PUT = async (
  request: NextRequest,
  { params }: { params: { learningRecordId: string } }
) => {
  const { learningRecordId } = params;

  try {
    const body = await request.json();
    console.log("Request Body:", body);

    const {
      title,
      date,
      startTime,
      endTime,
      content,
      categoryId,
      duration,
      supabaseUserId,
    } = body;

    if (
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !content ||
      !categoryId ||
      !duration ||
      !supabaseUserId
    ) {
      return NextResponse.json(
        { message: "リクエストボディのデータが不足しています" },
        { status: 400 }
      );
    }

    const { data, error } = await getCurrentUser(request);
    if (error || !data?.user) {
      return NextResponse.json(
        { message: "認証エラー: ユーザーが見つかりません" },
        { status: 401 }
      );
    }

    const { value: recordId, error: idError } =
      parseLearningRecordId(learningRecordId);
    if (!recordId) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const updatedRecord = await prisma.learningRecord.update({
      where: { id: recordId, supabaseUserId },
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

    // 📌 共通関数で継続日数を再計算
    const { currentStreak, bestStreak } =
      await recalculateStreakAfterLearningChange(supabaseUserId);

    console.log("✅ 学習記録を更新し、継続日数を再計算しました:", {
      currentStreak,
      bestStreak,
    });

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

// DELETE リクエスト: 学習記録の削除
export const DELETE = async (
  request: NextRequest,
  { params }: { params: { learningRecordId: string } }
) => {
  const { learningRecordId } = params;

  try {
    const { data, error } = await getCurrentUser(request);
    if (error || !data?.user) {
      return NextResponse.json(
        { message: "認証エラー: ユーザーが見つかりません" },
        { status: 401 }
      );
    }

    const supabaseUserId = data.user?.id;
    if (!supabaseUserId) {
      return NextResponse.json(
        { message: "認証エラー: supabaseUserIdが取得できません" },
        { status: 401 }
      );
    }

    const { value: recordId, error: idError } =
      parseLearningRecordId(learningRecordId);
    if (!recordId) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const deletedRecord = await prisma.learningRecord.delete({
      where: { id: recordId },
    });

    console.log("🗑️ 学習記録を削除しました");

    // 📌 削除後は本当のベスト連続記録を再計算する
    const bestStreak = await recalculateBestStreak(supabaseUserId);

    console.log("✅ 削除後に本当のベスト連続日数を再計算しました:", {
      bestStreak,
    });

    return NextResponse.json({ deletedRecord, bestStreak }, { status: 200 });
  } catch (error) {
    console.error("削除処理エラー:", error);
    return NextResponse.json(
      { message: "学習記録の削除に失敗しました" },
      { status: 500 }
    );
  }
};
