import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { supabase } from "@utils/supabase";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("ログアウト失敗:", error.message);
    } else {
      console.log("ログアウトしました");

      // ✅ 明示的にキャッシュキーを個別にクリア
      mutate("user", null);
      mutate("/api/dashboard", null);
      mutate("/api/user/profile", null);
      mutate("/api/learning-record", null);
      // 必要に応じて他のキーも追加

      router.push("/login");
    }
  };

  return { handleLogout };
};
