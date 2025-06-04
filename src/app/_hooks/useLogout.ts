"use client";

import { mutate } from "swr";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // ✅ API 経由で Supabase の Cookie セッションを削除
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("ログアウトAPIの呼び出しに失敗しました");
      }

      console.log("🔓 サーバー側ログアウト成功");

      // ✅ SWR のキャッシュを明示的に無効化（再フェッチしない）
      mutate("session-user", null, false);
      console.log("🗑️ キャッシュ削除: session-user");

      mutate("/api/dashboard", null, false);
      console.log("🗑️ キャッシュ削除: /api/dashboard");

      mutate("/api/user/profile", null, false);
      console.log("🗑️ キャッシュ削除: /api/user/profile");

      mutate("/api/learning-record", null, false);
      console.log("🗑️ キャッシュ削除: /api/learning-record");

      // ✅ クライアント側ストレージのログイン保持情報も削除
      if (typeof window !== "undefined") {
        localStorage.removeItem("persistLogin");
        sessionStorage.removeItem("persistLogin");
        console.log("🧹 ローカルストレージ削除完了");
      }

      // ✅ ログインページへ遷移
      router.push("/login");
    } catch (error) {
      console.error("❌ ログアウト処理エラー:", (error as Error).message);
    }
  };

  return { handleLogout };
};
