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
    } = body;

    console.log("受け取ったデータ:", body);

    const userObject = await prisma.user.findUnique({
      where: { supabaseUserId },
    });
    console.log("userObject:", userObject);

    // 誕生日が undefined または null の場合、本日の日付を設定
    const dateOfBirth = date_of_birth ? new Date(date_of_birth) : new Date();

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
        // 誕生日が null または undefined の場合、現在の日付を設定
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
        // 新規作成時にも誕生日が未指定の場合、本日の日付を設定
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
