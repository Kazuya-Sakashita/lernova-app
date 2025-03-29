"use client";

import { useState } from "react";
import { supabase } from "@utils/supabase"; // Supabaseのインポート
import { useRouter } from "next/navigation"; // ルーターのインポート
import { useForm } from "react-hook-form"; // フォーム管理用のフック
import { Label } from "@ui/label"; // ラベルコンポーネントのインポート
import { Button } from "@ui/button"; // ボタンコンポーネントのインポート
import { Input } from "@ui/input"; // 入力フォームコンポーネントのインポート
import Link from "next/link"; // リンクコンポーネントのインポート
import { LoginFormData } from "@/app/_types/formTypes"; // フォームデータの型定義
import AppLogoLink from "../_components/AppLogoLink"; // アプリロゴリンクのコンポーネント

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null); // エラーメッセージの状態管理
  const [emailSent, setEmailSent] = useState<boolean>(false); // 確認メール送信状態
  const router = useRouter(); // useRouterフックを使用してページ遷移

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues, // getValues をインポートしてフォームの値を取得
  } = useForm<LoginFormData>(); // react-hook-formのuseFormフック

  // ログイン処理
  const handleLogin = async (email: string, password: string) => {
    console.log("ログイン処理開始", { email }); // ログイン開始時にemailをログに出力

    // supabaseのサインイン処理
    const { data: userData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // 認証エラーがある場合
    if (authError) {
      console.log("認証エラー:", authError.message); // エラー時にエラーメッセージをログに出力
      setError(authError.message); // エラーメッセージを設定

      // Email not confirmedエラーの場合に再送信ボタン表示
      if (authError.message === "Email not confirmed") {
        setError("メールアドレスが未確認です。確認メールを開封してください。");
      }

      return null;
    }

    // ユーザーが確認されている場合、ユーザー情報を返す
    if (userData?.user?.confirmed_at) {
      console.log("ログイン成功:", userData.user); // ユーザー情報をログに出力
      setError(null); // ログイン成功時にエラーメッセージをクリア
      return userData.user;
    } else {
      console.log("未確認のメールアドレス"); // メール未確認時にログに出力
      setError("メールアドレスが未確認です。確認メールを開封してください。"); // メール確認を促すエラー
      return null;
    }
  };

  // 確認メールを再送信する関数
  const resendVerificationEmail = async () => {
    const email = getValues("email"); // フォームからメールアドレスを取得

    // 確認メールを再送信するために、仮のパスワードを使ってsignUpを呼び出す
    const { error } = await supabase.auth.signUp({
      email,
      password: "temporarypassword", // 仮のパスワードを設定（実際には変更されません）
    });

    if (error) {
      alert("確認メールの再送信に失敗しました: " + error.message);
    } else {
      setEmailSent(true); // 再送信後に状態を更新
      alert("確認メールを再送信しました。");
    }
  };

  // フォーム送信時の処理
  const onSubmit = async (data: LoginFormData) => {
    setError(null); // エラーメッセージをリセット
    const user = await handleLogin(data.email, data.password); // ログイン処理

    // ログイン成功時、ホームページにリダイレクト
    if (user) {
      router.push("/"); // ログイン成功後、ホームページにリダイレクト
    }
  };

  return (
    <div className="min-h-screen  flex justify-center items-center">
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
          {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
          {/* 認証エラーを表示 */}
          {/* メール確認再送信ボタン */}
          {error &&
            error ===
              "メールアドレスが未確認です。確認メールを開封してください。" && (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={resendVerificationEmail} // 再メール送信
                  className="w-full bg-pink-500 text-white hover:bg-pink-600"
                >
                  確認メールを再送信
                </Button>
                {emailSent && (
                  <p className="text-green-500 text-sm mt-2">
                    確認メールを再送信しました。
                  </p>
                )}
              </div>
            )}
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
