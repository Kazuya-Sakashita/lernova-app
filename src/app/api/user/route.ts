import { prisma } from "@/app/_utils/prisma";

export async function POST(request: Request) {
  try {
    // リクエストボディから必要な情報を取得
    const { nickname, supabaseUserId } = await request.json();

    // ✅ トランザクションで一連の処理をラップ（すべて成功するか、すべてロールバック）
    const result = await prisma.$transaction(async (tx) => {
      // 1. すでに同じ supabaseUserId を持つユーザーが存在するか確認
      const existingUser = await tx.user.findUnique({
        where: { supabaseUserId },
      });

      // 2. 存在すれば例外を投げてトランザクションを中断（ロールバックされる）
      if (existingUser) {
        throw new Error("ユーザーはすでに存在します。");
      }

      // 3. 新規ユーザー作成（ここに関連テーブル追加などの処理を追加可能）
      const newUser = await tx.user.create({
        data: {
          supabaseUserId,
          nickname,
          roleId: 1, // デフォルトのロール（例: 一般ユーザー）
        },
      });

      // 4. 作成したユーザー情報を返す（トランザクション成功時のみ）
      return newUser;
    });

    // ✅ トランザクションが正常に完了した場合、200 OK を返す
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: unknown) {
    // ❌ トランザクション失敗または他のエラー発生時の処理
    console.error("ユーザー情報の保存に失敗しました", error);

    // エラー内容を整形してレスポンスに含める
    const errorMessage =
      error instanceof Error && error.message === "ユーザーはすでに存在します。"
        ? error.message
        : "ユーザー情報の保存に失敗しました";

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
    });
  }
}
