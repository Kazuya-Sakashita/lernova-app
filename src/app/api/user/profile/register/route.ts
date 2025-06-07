import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// ========================================
// ✅ 共通関数: セッションから supabaseUserId を取得（クッキー対応）
// ========================================
// クッキーから Supabase セッションを読み取り、ログイン中のユーザーIDを取得する
async function getSupabaseUserId(): Promise<string | null> {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.warn("⚠️ ユーザーが未認証です（クッキーから取得できませんでした）");
    return null;
  }

  console.log("✅ ユーザー情報を取得しました:");
  console.log("🆔 ユーザーID:", user.id);
  console.log("📧 メール:", user.email);

  return user.id;
}

// ========================================
// ✅ POST: プロフィール情報を保存または更新
// ========================================
export async function POST(req: NextRequest) {
  // 認証されたユーザーのIDを取得
  const supabaseUserId = await getSupabaseUserId();
  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "未認証のリクエストです" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
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

    // ユーザーデータの取得（nicknameの更新確認用）
    const userObject = await prisma.user.findUnique({
      where: { supabaseUserId },
    });

    // nickname が変更されている場合のみ、user テーブルを更新
    if (userObject && userObject.nickname !== nickname) {
      await prisma.user.update({
        where: { supabaseUserId },
        data: { nickname },
      });
      console.log("ニックネームが更新されました:", nickname);
    }

    // date_of_birth が空の場合、本日の日付を使用
    const dateOfBirth = date_of_birth ? new Date(date_of_birth) : new Date();

    // profile テーブルの upsert（存在すれば更新、なければ作成）
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
        date_of_birth: dateOfBirth,
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
        date_of_birth: dateOfBirth,
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

// ========================================
// ✅ GET: プロフィール情報を取得
// ========================================
export async function GET() {
  const supabaseUserId = await getSupabaseUserId();
  if (!supabaseUserId) {
    return NextResponse.json(
      { message: "未認証のリクエストです" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseUserId },
      select: { nickname: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { supabaseUserId },
    });

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

    const response = profile
      ? { ...profile, nickname: user.nickname }
      : { ...defaultProfile, nickname: user.nickname };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("プロフィール取得エラー:", error);
    return NextResponse.json(
      { message: "プロフィール取得に失敗しました" },
      { status: 500 }
    );
  }
}
