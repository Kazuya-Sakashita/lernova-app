import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const { email, password, rememberMe } = await req.json();
    console.log("rememberMe:", rememberMe);

    // オプションを unknown として一時的に扱い、型エラーを回避
    const options = {
      cookies: () => cookieStore,
      cookieOptions: {
        lifetime: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 1,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    } as unknown as Parameters<typeof createServerActionClient>[0];

    const supabase = createServerActionClient(options);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        {
          message:
            error?.message === "Email not confirmed"
              ? "Email not confirmed"
              : error?.message || "ログインに失敗しました",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "ログイン成功" }, { status: 200 });
  } catch (e) {
    console.error("❌ Login API error:", e);
    return NextResponse.json(
      { message: "内部エラーが発生しました" },
      { status: 500 }
    );
  }
}
