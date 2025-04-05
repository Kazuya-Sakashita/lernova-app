import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      supabaseUserId,
      first_name,
      last_name,
      gender,
      bio,
      phoneNumber,
      socialLinks,
      profile_picture,
      date_of_birth, // 誕生日を受け取る
      nickname, // ニックネームも受け取る
    } = body;

    console.log("受け取ったデータ:", body);

    // ユーザーオブジェクトの取得
    const userObject = await prisma.user.findUnique({
      where: { supabaseUserId },
    });
    console.log("userObject:", userObject);

    // ユーザーが存在し、ニックネームが変更されている場合は、userテーブルを更新
    if (userObject && userObject.nickname !== nickname) {
      await prisma.user.update({
        where: { supabaseUserId },
        data: { nickname }, // ニックネームを更新
      });
      console.log("ニックネームが更新されました:", nickname);
    }

    // 誕生日が undefined または null の場合、本日の日付を設定
    const dateOfBirth = date_of_birth ? new Date(date_of_birth) : new Date();

    // プロフィールの upsert（更新または作成）
    const profile = await prisma.profile.upsert({
      where: { supabaseUserId },
      update: {
        first_name,
        last_name,
        gender,
        bio,
        phoneNumber,
        socialLinks,
        profile_picture,
        date_of_birth: dateOfBirth, // 本日の日付を設定
      },
      create: {
        supabaseUserId,
        first_name,
        last_name,
        gender,
        bio,
        phoneNumber,
        socialLinks,
        profile_picture,
        date_of_birth: dateOfBirth, // 本日の日付を設定
      },
    });

    console.log("プロフィールが正常に保存されました:", profile);

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("プロフィール保存エラー:", error);
    return NextResponse.json(
      { message: "プロフィール保存に失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // ヘッダーからsupabaseUserIdを取得
  const supabaseUserId = req.headers.get("supabaseUserId");
  console.log("supabaseUserId:", supabaseUserId);

  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "supabaseUserIdが提供されていません。" },
      { status: 400 }
    );
  }

  // supabaseUserIdを使ってプロフィールを検索
  const profile = await prisma.profile.findUnique({
    where: {
      supabaseUserId: String(supabaseUserId),
    },
  });

  if (!profile) {
    return NextResponse.json(
      { message: "プロフィールが見つかりません。" },
      { status: 404 }
    );
  }

  console.log("取得したプロフィール:", profile);

  return NextResponse.json(profile, { status: 200 });
}
