import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 🍪 クッキーログ
  const cookieValues = req.cookies.getAll();
  console.log("🍪 Cookies in request:", cookieValues);

  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    console.log("✅ middleware session:", session?.user?.email ?? null);
    if (error) {
      console.error("❌ middleware getSession error:", error.message);
    }

    // 🚧 ログイン不要なページ一覧（必要に応じて追加）
    const isPublicPage =
      req.nextUrl.pathname === "/" || // ホーム
      req.nextUrl.pathname.startsWith("/login") || // ログイン
      req.nextUrl.pathname.startsWith("/register"); // 登録など

    // 未ログインかつ公開ページでない場合は /login にリダイレクト
    if (!session && !isPublicPage) {
      console.warn(
        "🔁 セッションなし → /login にリダイレクト:",
        req.nextUrl.pathname
      );
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return res;
  } catch (e) {
    console.error("❌ middleware 例外:", e);
    return res;
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"], // ✅ api を除外
};
