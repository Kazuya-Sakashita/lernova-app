import useSWR, { mutate } from "swr";
import { supabase } from "./supabase";

// ユーザー情報を取得するためのfetcher関数
const fetchUserData = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const user = session.user;

    // 'User'テーブルからニックネームとroleIdを取得
    const { data, error } = await supabase
      .from("User")
      .select("nickname, roleId")
      .eq("supabaseUserId", user.id)
      .single();

    if (error) {
      console.error("ユーザー情報の取得エラー:", error.message);
      return null;
    }

    // Roleテーブルからrole_nameを取得
    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .select("role_name")
      .eq("id", data.roleId)
      .single();

    if (roleError) {
      console.error("役職情報の取得エラー:", roleError.message);
      return null;
    }

    // isAdminを判定（role_nameが"admin"ならtrue）
    const isAdmin = roleData?.role_name === "admin";

    return {
      email: user.email,
      id: user.id,
      nickname: data?.nickname || user.email,
      isAdmin,
    };
  }
  return null;
};

// useSessionフックでSWRを使用してユーザー情報を管理
export const useSession = () => {
  const { data, error } = useSWR("user", fetchUserData);

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    mutate("user", null); // SWRキャッシュをリセット
  };

  // isLoadingとisErrorをSWRで提供される情報をそのまま使用
  return {
    user: data,
    isLoading: !data && !error, // ローディング状態
    isError: error, // エラー状態
    handleLogout, // ログアウト関数
  };
};
