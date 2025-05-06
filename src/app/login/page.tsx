"use client";

import { useState } from "react";
import { supabase } from "@utils/supabase"; // Supabaseクライアント
import { useRouter } from "next/navigation"; // Next.jsのrouter
import { useForm } from "react-hook-form"; // フォーム管理
import { Label } from "@ui/label"; // ラベルUIコンポーネント
import { Button } from "@ui/button"; // ボタンUIコンポーネント
import { Input } from "@ui/input"; // 入力フィールドUIコンポーネント
import Link from "next/link"; // ページ遷移用Link
import { LoginFormData } from "@/app/_types/formTypes"; // フォームデータ型
import AppLogoLink from "../_components/AppLogoLink"; // ロゴリンクコンポーネント
import { useLearningRecords } from "@/app/_hooks/useLearningRecords"; // ✅ 学習記録フェッチ用カスタムフック

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null); // 認証エラーメッセージ
  const [emailSent, setEmailSent] = useState<boolean>(false); // メール再送信フラグ
  const router = useRouter(); // ページ遷移用
  const { refreshLearningRecords } = useLearningRecords(); // ✅ 学習記録のキャッシュ更新関数

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>(); // react-hook-formによるフォーム管理

  // ログイン処理
  const handleLogin = async (email: string, password: string) => {
    console.log("ログイン処理開始", { email });

    const { data: userData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.log("認証エラー:", authError.message);
      setError(authError.message);

      if (authError.message === "Email not confirmed") {
        setError("メールアドレスが未確認です。確認メールを開封してください。");
      }
      return null;
    }

    if (userData?.user?.confirmed_at) {
      console.log("ログイン成功:", userData.user);
      setError(null);
      return userData.user;
    } else {
      console.log("未確認のメールアドレス");
      setError("メールアドレスが未確認です。確認メールを開封してください。");
      return null;
    }
  };

  // 確認メール再送信
  const resendVerificationEmail = async () => {
    const email = getValues("email");

    const { error } = await supabase.auth.signUp({
      email,
      password: "temporarypassword",
    });

    if (error) {
      alert("確認メールの再送信に失敗しました: " + error.message);
    } else {
      setEmailSent(true);
      alert("確認メールを再送信しました。");
    }
  };

  // フォーム送信時の処理
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const user = await handleLogin(data.email, data.password);

    if (user) {
      // ✅ ログイン後に学習記録（直近3ヶ月）を取得してキャッシュ
      await refreshLearningRecords(user.id);
      console.log("✅ 学習記録の取得とキャッシュ成功");

      // ✅ ダッシュボードに遷移
      router.push("/user/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        {/* ロゴとタイトル */}
        <div className="text-center">
          <AppLogoLink
            href="/"
            logoText="Lernova"
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

        {/* フォーム入力エリア */}
        <div className="space-y-4">
          {/* メールアドレス入力 */}
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {
                required: "メールアドレスは必須です",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "無効なメールアドレスです",
                },
              })}
              className={`h-10 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* パスワード入力 */}
          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "パスワードは必須です",
                minLength: {
                  value: 8,
                  message: "パスワードは8文字以上必要です",
                },
              })}
              className={`h-10 ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* エラーメッセージ表示 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 確認メール再送信案内 */}
          {error ===
            "メールアドレスが未確認です。確認メールを開封してください。" && (
            <div className="mt-4">
              <Button
                type="button"
                onClick={resendVerificationEmail}
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

        {/* ログインボタン */}
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
