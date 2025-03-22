import { NextResponse } from "next/server";
import { prisma } from "@/app/_utils/prisma";

export async function POST(request: Request) {
  try {
    const { nickname, user_id } = await request.json();

    const newUser = await prisma.user.create({
      data: {
        supabaseUserId: user_id, // SupabaseのユーザーID
        nickname: nickname, // フォームからのニックネーム
        roleId: 1, // デフォルトでroleId 1
      },
    });
    console.log("User saved to Prisma:", newUser); // ユーザーが保存されたか確認

    return NextResponse.json({ newUser });
  } catch (error) {
    console.error("ユーザー情報の保存に失敗しました:", error);
    return NextResponse.json(
      { error: "ユーザー情報の保存に失敗しました" },
      { status: 500 }
    );
  }
}
