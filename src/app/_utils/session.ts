"use client";

import useSWR, { mutate } from "swr";
import { supabase } from "./supabase";
import { preloadLearningRecords } from "@/app/_hooks/useLearningRecords";

// 🔄 fetchUserData: ユーザーIDを引数として受け取り、ユーザーごとのキャッシュに対応
const fetchUserData = async (userId: string | undefined) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user && session.user.id === userId) {
    const user = session.user;
    console.log("✅ [fetchUserData] セッション取得: ", user.id);

    const { data, error } = await supabase
      .from("User")
      .select("nickname, roleId, supabaseUserId")
      .eq("supabaseUserId", user.id);

    if (error || !data || data.length === 0) {
      console.error(
        "❌ [fetchUserData] ユーザーデータ取得失敗:",
        error?.message
      );
      return null;
    }

    const userData = data[0];

    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .select("role_name")
      .eq("id", userData.roleId)
      .single();

    if (roleError) {
      console.error("❌ [fetchUserData] ロール取得失敗:", roleError.message);
      return null;
    }

    if (userData.supabaseUserId) {
      console.log("⏳ [fetchUserData] 学習記録をプリロード中...");
      preloadLearningRecords(userData.supabaseUserId).catch((err) =>
        console.error("❌ [fetchUserData] プリロード失敗:", err)
      );
    }

    console.log(`✅ [fetchUserData] ユーザーキャッシュ保存: user-${user.id}`);

    return {
      session,
      email: user.email,
      id: user.id,
      supabaseUserId: userData?.supabaseUserId,
      nickname: userData?.nickname || user.email,
      isAdmin: roleData?.role_name === "admin",
      token: session.access_token,
    };
  }

  console.warn("⚠️ [fetchUserData] セッションがない、またはID不一致");
  return null;
};

// ✅ useSession: ログイン状態とユーザー情報をSWRで管理するカスタムフック
export const useSession = () => {
  const { data: sessionData } = useSWR("supabase-session", async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    console.log("✅ [useSession] Supabaseセッションキャッシュ保存");
    return session;
  });

  const userId = sessionData?.user?.id;

  const { data, error } = useSWR(
    () => (userId ? `user-${userId}` : null),
    () => fetchUserData(userId)
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    console.log("🔓 [handleLogout] ログアウト実行");

    mutate("supabase-session", null);
    console.log("🗑️ [handleLogout] キャッシュ削除: supabase-session");

    if (userId) {
      mutate(`user-${userId}`, null);
      console.log(`🗑️ [handleLogout] キャッシュ削除: user-${userId}`);
    }
  };

  return {
    session: data?.session,
    user: data,
    token: data?.token,
    supabaseUserId: data?.supabaseUserId,
    isLoading: !data && !error,
    isError: error,
    handleLogout,
  };
};
