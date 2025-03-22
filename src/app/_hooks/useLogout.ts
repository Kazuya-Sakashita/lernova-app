import { supabase } from "@utils/supabase";
import { mutate } from "swr"; // mutate をインポート
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut(); // サインアウト処理
    if (error) {
      console.error("ログアウト失敗:", error.message); // エラーメッセージの表示
    } else {
      console.log("ログアウトしました"); // ログアウト完了
      // mutateを使用してキャッシュを無効化して、ユーザー情報をリセット
      mutate("user", null);
      // ログアウト後にホームにリダイレクト
      router.push("/login");
    }
  };

  return { handleLogout };
};
