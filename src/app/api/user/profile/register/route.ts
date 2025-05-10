import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";
import { authenticateUser } from "@/app/_utils/authenticateUser";

export async function POST(req: NextRequest) {
  const authError = await authenticateUser(req);
  if (authError) {
    return authError; // 認証に失敗した場合はエラーを返す
  }

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
      date_of_birth,
      nickname,
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
  // リクエストヘッダーから supabaseUserId を取得
  const supabaseUserId = req.headers.get("supabaseUserId");

  // supabaseUserId が存在しない場合は 400 を返す
  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "supabaseUserIdが提供されていません。" },
      { status: 400 }
    );
  }

  // user テーブルから nickname を取得（nickname は user に保存されている）
  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { nickname: true },
  });

  // ユーザーが存在しない場合は 404 を返す
  if (!user) {
    return NextResponse.json(
      { message: "ユーザーが見つかりません。" },
      { status: 404 }
    );
  }

  // profile テーブルからプロフィールを取得（存在しない場合もあり得る）
  const profile = await prisma.profile.findUnique({
    where: { supabaseUserId },
  });

  // プロフィール未登録時に返すデフォルトの空データを定義
  const defaultProfile = {
    supabaseUserId,
    first_name: "",
    last_name: "",
    gender: "",
    bio: "",
    phoneNumber: "",
    socialLinks: "",
    profile_picture: "",
    date_of_birth: "",
  };

  // プロフィールがある場合はそれを返し、無ければ空データ + nickname を返す
  const response = profile
    ? { ...profile, nickname: user.nickname }
    : { ...defaultProfile, nickname: user.nickname };

  // 成功レスポンスとして返却
  return NextResponse.json(response, { status: 200 });
}
