"use client";

import { useState } from "react";
import { supabase } from "@utils/supabase"; // Supabaseのインポート
import { useRouter } from "next/navigation"; // ルーターのインポート
import { useForm } from "react-hook-form"; // フォーム管理用のフック
import { Label } from "@ui/label"; // ラベルコンポーネントのインポート
import { Button } from "@ui/button"; // ボタンコンポーネントのインポート
import { Input } from "@ui/input"; // 入力フォームコンポーネントのインポート
import Link from "next/link"; // リンクコンポーネントのインポート
import { LoginFormData } from "@/app/_types/formTypes"; // フォームデータの型定義}
import AppLogoLink from "../_components/AppLogoLink";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null); // エラーメッセージの状態管理
  const router = useRouter(); // useRouterフックを使用してページ遷移

  const {
    register,
    handleSubmit,
    formState: { errors }, // フォームエラーの状態を管理
  } = useForm<LoginFormData>(); // react-hook-formのuseFormフック

  // ログイン処理
  const handleLogin = async (email: string, password: string) => {
    // supabaseのサインイン処理
    const { data: userData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // 認証エラーがある場合
    if (authError) {
      setError(authError.message); // エラーメッセージを設定
      return null;
    }

    // ユーザーが確認されている場合、ユーザー情報を返す
    if (userData?.user?.confirmed_at) {
      return userData.user;
    } else {
      setError("メールアドレスが未確認です。確認メールを開封してください。"); // メール確認を促すエラー
      return null;
    }
  };

  // フォーム送信時の処理
  const onSubmit = async (data: LoginFormData) => {
    setError(null); // エラーメッセージをリセット
    const user = await handleLogin(data.email, data.password); // ログイン処理

    // ログイン成功時、ホームページにリダイレクト
    if (user) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center">
          {/* アプリロゴ */}
          <AppLogoLink
            href="/" // リンク先
            logoText="Lernova" // ロゴのテキスト
            textColor="text-pink-500"
            textSize="text-xl"
            iconColor="text-pink-500"
            bgColor="bg-pink-50"
          />
          <h1 className="text-2xl font-semibold">ログイン</h1>
          <p className="text-sm text-gray-600 mt-2">
            アカウントをお持ちでない方は、
            <Link href="/signup" className="text-pink-500">
              こちらから登録
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          {/* メールアドレス入力フォーム */}
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {
                required: "メールアドレスは必須です", // 必須バリデーション
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // メールアドレスの形式チェック
                  message: "無効なメールアドレスです", // 不正な形式のエラーメッセージ
                },
              })}
              className={`h-10 ${errors.email ? "border-red-500" : ""}`} // エラーがある場合に赤枠
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p> // エラーメッセージ表示
            )}
          </div>

          {/* パスワード入力フォーム */}
          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "パスワードは必須です", // 必須バリデーション
                minLength: {
                  value: 8,
                  message: "パスワードは8文字以上である必要があります", // 最小文字数チェック
                },
              })}
              className={`h-10 ${errors.password ? "border-red-500" : ""}`} // エラーがある場合に赤枠
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p> // エラーメッセージ表示
            )}
          </div>

          {/* エラーメッセージ */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-pink-500 text-white hover:bg-pink-600"
        >
          ログイン
        </Button>
      </form>
    </div>
  );
}
