import { useState, useEffect } from "react";
import { useSession } from "@/app/_utils/session"; // セッション情報（SWR）を取得
import { UserProfile } from "@/app/_types/formTypes"; // プロフィール型定義

const useUserProfile = () => {
  // プロフィールデータの状態
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Supabaseのセッション情報を取得（ログイン済みのユーザー情報）
  const { user } = useSession();

  useEffect(() => {
    // ユーザー情報が取得できたときのみプロフィール取得処理を行う
    if (user) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/user/profile", {
            method: "GET",
            credentials: "include", // ✅ クッキーで認証情報を送信（セッションに必要）
          });

          console.log("プロフィール取得レスポンス:", res.status);

          if (!res.ok) {
            throw new Error("プロフィール取得に失敗しました");
          }

          const data = await res.json();

          // サーバーから返ってきた `nickname` を使用（user.nickname は不要）
          setProfileData(data);
        } catch (error) {
          console.error("プロフィールの取得に失敗しました:", error);
        } finally {
          setIsLoading(false); // ローディング終了
        }
      };

      fetchProfile();
    }
  }, [user]); // userが変化したときに再取得

  return { profileData, isLoading };
};

export default useUserProfile;
