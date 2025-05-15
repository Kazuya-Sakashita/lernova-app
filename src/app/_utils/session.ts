"use client";

import useSWR, { mutate } from "swr";
import { supabase } from "./supabase";
import type { SessionUser } from "../_types/formTypes";
import type { Session } from "@supabase/supabase-js";
import { preloadLearningRecords } from "@/app/_hooks/useLearningRecords";

// Supabase セッション取得
async function getSupabaseSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log("✅ [getSupabaseSession] Session fetched:", session?.user?.id);
  return session;
}

// ユーザー情報取得（+ 学習記録のプリロード）
async function fetchUserData(userId: string): Promise<SessionUser | null> {
  if (!userId) {
    console.warn("⚠️ [fetchUserData] userId is empty");
    return null;
  }

  const session = await getSupabaseSession();
  if (!session?.user || session.user.id !== userId) {
    console.warn("⚠️ [fetchUserData] Session missing or ID mismatch");
    return null;
  }

  console.log("✅ [fetchUserData] Session user:", userId);

  const { data: users, error: userError } = await supabase
    .from("User")
    .select("nickname, roleId, supabaseUserId")
    .eq("supabaseUserId", userId);

  if (userError || !users || users.length === 0) {
    console.error(
      "❌ [fetchUserData] Failed to fetch User record:",
      userError?.message
    );
    return null;
  }

  const userData = users[0];

  const { data: roles, error: roleError } = await supabase
    .from("Role")
    .select("role_name")
    .eq("id", userData.roleId)
    .single();

  if (roleError) {
    console.error(
      "❌ [fetchUserData] Failed to fetch Role record:",
      roleError.message
    );
    return null;
  }

  if (userData.supabaseUserId) {
    console.log("⏳ [fetchUserData] Preloading learning records...");
    preloadLearningRecords(userData.supabaseUserId).catch((err) =>
      console.error("❌ [fetchUserData] Preload failed:", err)
    );
  }

  console.log(`✅ [fetchUserData] Caching user-${userId}`);
  return {
    session,
    email: session.user.email!,
    id: session.user.id,
    supabaseUserId: userData.supabaseUserId,
    nickname: userData.nickname || session.user.email!,
    isAdmin: roles.role_name === "admin",
    token: session.access_token,
  };
}

// useSession フック
export function useSession() {
  const { data: session, error: sessionError } = useSWR<Session | null>(
    "supabase-session",
    getSupabaseSession
  );

  const userId = session?.user?.id;
  const key = userId ? `user-${userId}` : null;
  const fetcher = () => fetchUserData(userId ?? "");

  const { data: user, error } = useSWR<SessionUser | null>(key, fetcher);

  // 🔒 ログアウト処理（セッション削除 + SWRキャッシュクリア + ストレージリセット）
  const handleLogout = async () => {
    await supabase.auth.signOut();
    console.log("🔓 [handleLogout] Signed out");

    // SWRキャッシュクリア
    mutate("supabase-session", null);
    console.log("🗑️ [handleLogout] Cleared cache: supabase-session");

    if (userId) {
      mutate(`user-${userId}`, null);
      console.log(`🗑️ [handleLogout] Cleared cache: user-${userId}`);
    }

    // ログイン状態保存情報を削除（localStorage / sessionStorage 両方）
    if (typeof window !== "undefined") {
      localStorage.removeItem("persistLogin");
      sessionStorage.removeItem("persistLogin");
      console.log("🧹 [handleLogout] Removed login persistence flags");
    }
  };

  return {
    session: session ?? null,
    user: user ?? null,
    token: user?.token ?? null,
    supabaseUserId: user?.supabaseUserId ?? null,
    isLoading: !session && !sessionError,
    isError: error ?? sessionError,
    handleLogout,
  };
}
