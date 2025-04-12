import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma"; // Prismaクライアントをインポート
import { supabase } from "@utils/supabase"; // Supabaseクライアントをインポート

// PUT リクエスト: 学習記録の更新
export const PUT = async (
  request: NextRequest,
  { params }: { params: { learningRecordId: string } }
) => {
  const { learningRecordId } = params; // 動的ルートパラメータlearningRecordIdをparamsから取得

  // デバッグ用ログ
  console.log("Learning Record ID:", learningRecordId);

  // learningRecordIdが存在しない場合はエラーを返す
  if (!learningRecordId) {
    return NextResponse.json(
      { message: "学習記録IDが不足しています" },
      { status: 400 }
    );
  }

  try {
    // PUTリクエストのボディをJSONとして取得
    const body = await request.json();
    console.log("Request Body:", body); // ボディ内容をデバッグ用に表示

    const { title, date, startTime, endTime, content, categoryId, duration } =
      body;

    // ボディのデータが不足していないかチェック
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

    // トークンをヘッダーから取得
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "認証エラー: トークンが不足しています" },
        { status: 401 }
      );
    }

    // トークンを検証 (supabase.auth.getUser()を使用)
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) {
      return NextResponse.json(
        { message: "認証エラー: ユーザーが見つかりません" },
        { status: 401 }
      );
    }

    // learningRecordIdをnumber型に変換
    const recordId = Number(learningRecordId);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { message: "無効な学習記録IDです" },
        { status: 400 }
      );
    }

    // Prismaで学習記録を更新
    const updatedRecord = await prisma.learningRecord.update({
      where: { id: recordId }, // PrismaではIDを数値で指定
      data: {
        title,
        learning_date: new Date(date),
        start_time: new Date(`2000-01-01T${startTime}:00`),
        end_time: new Date(`2000-01-01T${endTime}:00`),
        content,
        categoryId: Number(categoryId), // categoryIdを明示的に数値型に変換
        duration,
      },
    });

    // 更新成功時のレスポンス
    return NextResponse.json(updatedRecord, { status: 200 });
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
  const { learningRecordId } = params; // 動的ルートパラメータlearningRecordIdをparamsから取得

  // デバッグ用ログ
  console.log("Learning Record ID:", learningRecordId);

  // learningRecordIdが存在しない場合はエラーを返す
  if (!learningRecordId) {
    return NextResponse.json(
      { message: "学習記録IDが不足しています" },
      { status: 400 }
    );
  }

  try {
    // トークンをヘッダーから取得
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "認証エラー: トークンが不足しています" },
        { status: 401 }
      );
    }

    // トークンを検証 (supabase.auth.getUser()を使用)
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data) {
      return NextResponse.json(
        { message: "認証エラー: ユーザーが見つかりません" },
        { status: 401 }
      );
    }

    // learningRecordIdをnumber型に変換
    const recordId = Number(learningRecordId);
    if (isNaN(recordId)) {
      return NextResponse.json(
        { message: "無効な学習記録IDです" },
        { status: 400 }
      );
    }

    // Prismaで学習記録を削除
    const deletedRecord = await prisma.learningRecord.delete({
      where: { id: recordId }, // PrismaではIDを数値で指定
    });

    // 削除成功時のレスポンス
    return NextResponse.json(deletedRecord, { status: 200 });
  } catch (error) {
    console.error("削除処理エラー:", error);
    return NextResponse.json(
      { message: "学習記録の削除に失敗しました" },
      { status: 500 }
    );
  }
};

// 学習記録を新規作成するエンドポイント（POST）
export const POST = async (req: NextRequest) => {
  try {
    const record = await req.json(); // リクエストボディをJSONとして取得
    console.log("Received record:", record); // デバッグ用ログ

    // 必要なデータが揃っているか確認
    const {
      title,
      date,
      startTime,
      endTime,
      content,
      categoryId,
      duration,
      supabaseUserId,
    } = record;

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
        { message: "必要なデータが不足しています" },
        { status: 400 }
      );
    }

    // Prismaで新しいレコードを保存
    const newRecord = await prisma.learningRecord.create({
      data: {
        supabaseUserId,
        categoryId,
        title,
        learning_date: new Date(date), // dateをDate型に変換
        start_time: new Date(`2000-01-01T${startTime}:00`), // startTimeをDate型に変換
        end_time: new Date(`2000-01-01T${endTime}:00`), // endTimeをDate型に変換
        content,
        duration,
      },
    });

    return NextResponse.json({ status: "success", newRecord }, { status: 201 });
  } catch (error) {
    console.error("保存処理エラー:", error);
    return NextResponse.json(
      { message: "学習記録の保存に失敗しました" },
      { status: 500 }
    );
  }
};
