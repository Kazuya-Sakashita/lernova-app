import useSWR, { mutate } from "swr";
import { supabase } from "./supabase";

// ユーザー情報を取得するためのfetcher関数
// ユーザー情報を取得するためのfetcher関数
const fetchUserData = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const user = session.user;

    console.log("Session User ID:", user.id); // ユーザーIDをログに出力

    // 'User'テーブルからニックネームとroleIdを取得
    const { data, error } = await supabase
      .from("User")
      .select("nickname, roleId")
      .eq("supabaseUserId", user.id); // supabaseUserId を使って検索

    if (error) {
      console.error("ユーザー情報の取得エラー:", error.message);
      return null;
    }

    console.log("取得したデータ:", data); // 取得したデータをログに出力

    if (!data || data.length === 0) {
      console.error("ユーザーが見つかりませんでした");
      return null;
    }

    // 最初のデータを取得（複数行が返されていた場合）
    const userData = data[0];

    // Roleテーブルからrole_nameを取得
    const { data: roleData, error: roleError } = await supabase
      .from("Role")
      .select("role_name")
      .eq("id", userData.roleId)
      .single();

    if (roleError) {
      console.error("役職情報の取得エラー:", roleError.message);
      return null;
    }

    console.log("取得した役職データ:", roleData); // 役職データをログに出力

    const isAdmin = roleData?.role_name === "admin";

    return {
      session,
      email: user.email,
      id: user.id,
      nickname: userData?.nickname || user.email, // nicknameがない場合はemailを使用
      isAdmin,
      token: session.access_token, // トークンを返す
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
    session: data?.session,
    user: data,
    token: data?.token, // トークンも返す
    isLoading: !data && !error, // ローディング状態
    isError: error, // エラー状態
    handleLogout, // ログアウト関数
  };
};
