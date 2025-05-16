"use client";

import { useState } from "react";
import { supabase } from "@utils/supabase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Label } from "@ui/label";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import Link from "next/link";
import { LoginFormData } from "@/app/_types/formTypes";
import AppLogoLink from "../_components/AppLogoLink";

export default function LoginPage() {
  // -------------------------------
  // 状態管理
  // -------------------------------
  const [error, setError] = useState<string | null>(null); // 認証エラー表示
  const [emailSent, setEmailSent] = useState<boolean>(false); // 確認メール送信済み状態
  const [rememberMe, setRememberMe] = useState<boolean>(false); // ✅ ログイン保持の選択状態
  const router = useRouter();

  // react-hook-form によるフォーム状態管理
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>();

  // -------------------------------
  // ログイン処理
  // -------------------------------
  const handleLogin = async (email: string, password: string) => {
    console.log("ログイン処理開始", { email, rememberMe });

    // ✅ 永続ログイン状態の保存（storage の切り替え）
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("persistLogin", "true");
        sessionStorage.removeItem("persistLogin");
      } else {
        sessionStorage.setItem("persistLogin", "false");
        localStorage.removeItem("persistLogin");
      }
    }

    // Supabase でログイン試行
    const { data: userData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // 認証失敗時の処理
    if (authError) {
      console.error("認証エラー:", authError.message);
      if (authError.message === "Email not confirmed") {
        setError("メールアドレスが未確認です。確認メールを開封してください。");
      } else {
        setError(authError.message);
      }
      return null;
    }

    // 認証成功・確認済みチェック
    if (userData?.user?.confirmed_at) {
      setError(null);
      return userData.user;
    } else {
      setError("メールアドレスが未確認です。確認メールを開封してください。");
      return null;
    }
  };

  // -------------------------------
  // 確認メール再送信処理
  // -------------------------------
  const resendVerificationEmail = async () => {
    const email = getValues("email");

    const { error } = await supabase.auth.signUp({
      email,
      password: "temporarypassword", // 仮のパスワードで再送要求
    });

    if (error) {
      alert("確認メールの再送信に失敗しました: " + error.message);
    } else {
      setEmailSent(true);
      alert("確認メールを再送信しました。");
    }
  };

  // -------------------------------
  // フォーム送信処理（ログイン本体）
  // -------------------------------
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const user = await handleLogin(data.email, data.password);

    if (user) {
      // ✅ 学習記録はセッション取得時にプリロード済み
      router.push("/user/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
        {/* -------------------- */}
        {/* ロゴ・タイトルセクション */}
        {/* -------------------- */}
        <div className="text-center">
          <AppLogoLink
            href="/"
            logoText="Lernova"
            textColor="text-pink-500"
            textSize="text-xl"
            iconColor="text-pink-500"
            bgColor="bg-pink-50"
          />
          <h1 className="text-2xl font-semibold mt-2">ログイン</h1>
          <p className="text-sm text-gray-600 mt-2">
            アカウントをお持ちでない方は、
            <Link href="/signup" className="text-pink-500 hover:underline">
              こちらから登録
            </Link>
          </p>
        </div>

        {/* -------------------- */}
        {/* 入力フィールド */}
        {/* -------------------- */}
        <div className="space-y-4">
          {/* メールアドレス */}
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              {...register("email", {
                required: "メールアドレスは必須です",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "無効なメールアドレスです",
                },
              })}
              className={`h-10 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* パスワード */}
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

          {/* ✅ ログイン状態保持チェックボックス */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
              className="accent-pink-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              ログイン状態を保持する（localStorage）
            </label>
          </div>

          {/* エラー表示 */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* メール未確認時の案内 */}
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

        {/* -------------------- */}
        {/* ログインボタン */}
        {/* -------------------- */}
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
