import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { supabase } from "@utils/supabase";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ ログアウト失敗:", error.message);
    } else {
      console.log("🔓 ログアウトしました");

      // ✅ 明示的にキャッシュキーを個別にクリアしつつログ出力
      mutate("supabase-session", null); // セッションのキャッシュ削除
      console.log("🗑️ キャッシュ削除: supabase-session");

      mutate("user", null); // ユーザー情報のキャッシュ削除
      console.log("🗑️ キャッシュ削除: user");

      // 必要に応じて他のキャッシュをクリア
      mutate("/api/dashboard", null);
      console.log("🗑️ キャッシュ削除: /api/dashboard");

      mutate("/api/user/profile", null);
      console.log("🗑️ キャッシュ削除: /api/user/profile");

      mutate("/api/learning-record", null);
      console.log("🗑️ キャッシュ削除: /api/learning-record");

      // 必要なキャッシュがあれば追加
      // mutate("your-key", null); console.log("🗑️ キャッシュ削除: your-key");

      // ログインページにリダイレクト
      router.push("/login");
    }
  };

  return { handleLogout };
};
