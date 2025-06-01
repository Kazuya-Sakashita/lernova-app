"use client";

import useSWR, { mutate } from "swr";
import type { SessionUser } from "../_types/formTypes";
import { preloadLearningRecords } from "@/app/_hooks/useLearningRecords";

// カスタムエラー型
type HttpError = Error & { status?: number };

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

    if (user?.supabaseUserId) {
      preloadLearningRecords().catch((err: unknown) =>
        console.error("❌ 学習記録のプリロードに失敗:", err)
      );
    }

    return user;
  } catch (error: unknown) {
    // エラーが Error 型であり、status を持っていれば取得
    const err = error as HttpError;
    if (!err.status) {
      console.error("❌ セッション取得処理で例外発生:", error);
    }
    return null;
  }
}

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

  return {
    user: user ?? null,
    token: user?.token ?? null,
    supabaseUserId: user?.supabaseUserId ?? null,
    isLoading,
    isError: error,
    handleLogout,
  };
}
