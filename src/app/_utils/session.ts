"use client";

import useSWR, { mutate } from "swr";
import { supabase } from "./supabase";
import { preloadLearningRecords } from "@/app/_hooks/useLearningRecords"; // ✅ ログイン時の学習記録事前取得関数をインポート

// ---------------------------------------------
// 🔄 fetchUserData: ユーザー情報を取得する非同期関数
// - Supabaseのセッションからユーザー情報を取得
// - Userテーブルからニックネーム・ロール情報を取得
// - ログイン時に学習記録をプリロードしてSWRにキャッシュ
// ---------------------------------------------
const fetchUserData = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ✅ セッションが存在し、ユーザーがログインしている場合のみ処理を継続
  if (session?.user) {
    const user = session.user;

    console.log("Session User ID:", user.id); // ✅ Supabase認証IDの確認ログ

    // ✅ Userテーブルからnickname, roleId, supabaseUserId を取得
    const { data, error } = await supabase
      .from("User")
      .select("nickname, roleId, supabaseUserId")
      .eq("supabaseUserId", user.id);

    if (error) {
      console.error("ユーザー情報の取得エラー:", error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("ユーザーが見つかりませんでした");
      return null;
    }

    const userData = data[0];

    // ✅ Roleテーブルからロール名を取得
    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .select("role_name")
      .eq("id", userData.roleId)
      .single();

    if (roleError) {
      console.error("役職情報の取得エラー:", roleError.message);
      return null;
    }

    const isAdmin = roleData?.role_name === "admin";

    // ✅ ログイン時に学習記録をSWRにプリロード
    if (userData.supabaseUserId) {
      preloadLearningRecords(userData.supabaseUserId).catch((err) =>
        console.error("学習記録のプリロードに失敗:", err)
      );
    }

    // ✅ ユーザー情報を整形して返す
    return {
      session,
      email: user.email,
      id: user.id,
      supabaseUserId: userData?.supabaseUserId,
      nickname: userData?.nickname || user.email, // ニックネームがない場合はemailを使用
      isAdmin,
      token: session.access_token,
    };
  }

  // ✅ セッションが存在しない場合（未ログイン）は null を返す
  return null;
};

// ---------------------------------------------
// useSession: ユーザー情報取得用のカスタムフック
// - fetchUserData をSWRで管理
// - ログアウト処理も提供
// ---------------------------------------------
export const useSession = () => {
  const { data, error } = useSWR("user", fetchUserData);

  // 🔓 ログアウト処理（セッション削除＆キャッシュリセット）
  const handleLogout = async () => {
    await supabase.auth.signOut();
    mutate("user", null);
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
