import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@utils/prisma"; // Prismaクライアントをインポート
import { supabase } from "@utils/supabase"; // Supabaseクライアントをインポート

export const POST = async (request: NextRequest) => {
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

    // PUTリクエストのボディをJSONとして取得
    const body = await request.json();

    const { title, category, startTime, endTime, content } = body;

    // `categoryId` を取得するため、category名から対応するIDを取得
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
    });
    if (!categoryRecord) {
      return NextResponse.json(
        { message: "カテゴリが見つかりません" },
        { status: 400 }
      );
    }

    // durationを計算（秒数）
    const duration = Math.floor(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
    );

    // 学習日を計算（通常はstartTimeの日付を使用）
    const learningDate = new Date(startTime).toISOString().split("T")[0];

    // 学習記録の新規作成
    const newRecord = await prisma.learningRecord.create({
      data: {
        title,
        categoryId: categoryRecord.id, // categoryIdを保存
        learning_date: learningDate, // 学習日を保存
        start_time: new Date(startTime), // 修正
        end_time: new Date(endTime), // 修正
        content,
        duration, // 学習時間の長さ
        supabaseUserId: data.user.id, // SupabaseのユーザーID
      },
    });

    // 成功レスポンス
    return NextResponse.json(newRecord, { status: 200 });
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json(
      { message: "学習記録の保存に失敗しました" },
      { status: 500 }
    );
  }
};
