// src/app/api/session/route.ts

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

// ✅ SupabaseのCookie操作はEdgeランタイム非対応 → Node.jsを明示
export const runtime = "nodejs";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // ✅ セッションの取得
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  console.log("✅ session:", session);
  console.log("❌ session error:", error);

  if (error || !session?.user) {
    console.warn("❌ セッションなしまたは認証失敗");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;

  // ✅ SupabaseのUserテーブルからユーザー情報を取得
  const { data: user, error: userError } = await supabase
    .from("User") // 必要に応じて "users" に変更
    .select("nickname, roleId, supabaseUserId")
    .eq("supabaseUserId", supabaseUserId)
    .maybeSingle();

  if (userError || !user) {
    console.warn("❌ ユーザー情報が見つかりません:", userError?.message);
    return NextResponse.json(
      { message: "ユーザー情報が見つかりません" },
      { status: 404 }
    );
  }

  // ✅ クライアント側で使用するセッションユーザー情報を返す
  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    supabaseUserId: user.supabaseUserId,
    nickname: user.nickname,
    isAdmin: user.roleId === 1,
    token: null, // JWTトークンを扱う場合はここにセット
  });
}
