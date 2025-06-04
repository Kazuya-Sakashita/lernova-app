import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ✅ Edgeランタイムではなく Node.js を指定（クッキー操作のため）
export const runtime = "nodejs";

// POST /api/logout
export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  // Supabaseセッションを削除（ログアウト処理）
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ サーバー側のログアウト失敗:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ✅ クッキーの状態確認（デバッグ用）
  const cookieValues = cookies().getAll();
  console.log("✅ ログアウト後のクッキー一覧:", cookieValues);

  console.log("✅ サーバー側でログアウト完了");
  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
