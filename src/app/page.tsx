"use client";

import { useLogout } from "@hooks/useLogout"; // useLogoutをインポート
import { useSession } from "@utils/session";

export default function Home() {
  const { user, isError } = useSession();
  const { handleLogout } = useLogout(); // useLogoutを呼び出す

  if (isError) {
    return <div>ユーザー情報の取得に失敗しました。</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div>
        {user ? (
          <>
            <p>こんにちは, {user.nickname ?? user.email} さん！</p>
            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              ログアウト
            </button>
          </>
        ) : (
          <p>ログインしていません。</p>
        )}
      </div>
    </div>
  );
}
