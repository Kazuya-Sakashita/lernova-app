// src/app/api/session/route.ts

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@utils/prisma"; // prisma client のパスに合わせて変更してください

export const runtime = "nodejs";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // ✅ セッションの取得
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabaseUserId = session.user.id;

  // ✅ Prismaでユーザー情報とロールを取得
  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
    include: {
      role: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "ユーザー情報が見つかりません" },
      { status: 404 }
    );
  }

  const isAdmin = user.role?.role_name === "admin";

  // ✅ クライアントに返すセッション情報
  return NextResponse.json({
    id: session.user.id,
    email: session.user.email,
    supabaseUserId: user.supabaseUserId,
    nickname: user.nickname,
    isAdmin,
    token: null,
  });
}
