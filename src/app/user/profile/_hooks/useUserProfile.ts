import { useState, useEffect } from "react";
import { useSession } from "@/app/_utils/session"; // SWRからセッション情報を取得
import { UserProfile } from "@/app/_types/formTypes"; // 型をインポート

const useUserProfile = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null); // 型を追加
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSession(); // SWRでセッション情報を取得

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          // ユーザーのIDを使ってプロフィール情報を取得
          const res = await fetch("/api/user/profile/register", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
              supabaseUserId: user.id, // ユーザーIDを渡す
            },
          });

          console.log("レスポンスステータス:", res.status);

          if (!res.ok) {
            throw new Error("プロフィール取得に失敗しました");
          }

          const data = await res.json();

          // プロフィールデータが存在した場合、ニックネームをユーザー情報から取得
          const userProfile = {
            ...data,
            nickname: user.nickname, // `nickname`を`User`テーブルから取得してセット
          };

          setProfileData(userProfile);
        } catch (error) {
          console.error("プロフィールの取得に失敗しました:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user]);

  return { profileData, isLoading };
};

export default useUserProfile;
