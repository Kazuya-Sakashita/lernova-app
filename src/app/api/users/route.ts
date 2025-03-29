import { prisma } from "@/app/_utils/prisma";

export async function POST(request: Request) {
  try {
    // リクエストボディからnicknameとsupabaseUserIdを抽出
    const { nickname, supabaseUserId } = await request.json();

    // ユーザーがすでに存在するかチェック
    const existingUser = await prisma.user.findUnique({
      where: {
        supabaseUserId: supabaseUserId, // supabaseUserId で検索
      },
    });

    // すでにユーザーが存在する場合はエラーメッセージを返す
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "ユーザーはすでに存在します。" }),
        { status: 400 }
      );
    }

    // 新しいユーザーを作成（デフォルトのroleIdは1）
    const newUser = await prisma.user.create({
      data: {
        supabaseUserId,
        nickname,
        roleId: 1, // デフォルトでroleId 1
      },
    });

    // 作成したユーザー情報を返す
    return new Response(JSON.stringify(newUser), { status: 200 });
  } catch (error) {
    // エラーログを出力し、エラーレスポンスを返す
    console.error("ユーザー情報の保存に失敗しました", error);
    return new Response("ユーザー情報の保存に失敗しました", { status: 500 });
  }
}
