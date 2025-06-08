"use client";

import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import type { SessionUser } from "../_types/formTypes";
import { preloadDashboardData } from "@/app/_utils/preloadDashboardData"; // ← ここを追加

// カスタムエラー型
type HttpError = Error & { status?: number };

// セッション取得フェッチャー関数
async function fetchSessionUser(): Promise<SessionUser | null> {
  try {
    const res = await fetch("/api/session", {
      method: "GET",
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";

    if (res.status === 401) {
      const error: HttpError = new Error("Unauthorized");
      error.status = 401;
      throw error;
    }

    if (!res.ok || !contentType.includes("application/json")) {
      throw new Error("Invalid session response");
    }

    const user: SessionUser = await res.json();

    // ✅ セッションユーザーが存在すればダッシュボード用データをプリロード
    if (user?.supabaseUserId) {
      preloadDashboardData().catch((err: unknown) =>
        console.error("❌ ダッシュボードデータのプリロードに失敗:", err)
      );
    }

    // ✅ roleId の存在確認ログ
    if (user && "isAdmin" in user) {
      console.log("🧭 Supabase roleId 判定結果（isAdmin）:", user.isAdmin);
    } else {
      console.warn("⚠️ 'isAdmin' プロパティが user オブジェクトに存在しません");
    }

    return user;
  } catch (error: unknown) {
    const err = error as HttpError;
    if (!err.status) {
      console.error("❌ セッション取得処理で例外発生:", error);
    }
    return null;
  }
}

// カスタムフック本体
export function useSession() {
  const {
    data: user,
    error,
    isLoading,
  } = useSWR<SessionUser | null>("session-user", fetchSessionUser, {
    onErrorRetry: (
      error: HttpError,
      _key,
      _config,
      revalidate,
      { retryCount }
    ) => {
      if (error?.status === 401) return;
      if (retryCount >= 3) return;
      setTimeout(() => revalidate({ retryCount }), 2000);
    },
  });

  // ログアウト処理
  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      console.error("❌ ログアウトAPIの呼び出しに失敗しました");
      return;
    }

    mutate("session-user", null, false);

    if (typeof window !== "undefined") {
      localStorage.removeItem("persistLogin");
      sessionStorage.removeItem("persistLogin");
      console.log("🧹 ログイン保持情報削除");
    }
  };

  // 管理者フラグログ出力
  useEffect(() => {
    if (user) {
      console.log("✅ isAdmin:", user.isAdmin);
      if (user.isAdmin === false) {
        console.log("🔍 管理者ではないユーザーとして扱われます");
      }
    }
  }, [user]);

  return {
    user: user ?? null,
    token: user?.token ?? null,
    supabaseUserId: user?.supabaseUserId ?? null,
    isAdmin: user?.isAdmin ?? false,
    isLoading,
    isError: error,
    handleLogout,
  };
}
