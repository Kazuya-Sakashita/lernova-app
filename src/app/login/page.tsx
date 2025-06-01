"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Label } from "@ui/label";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import Link from "next/link";
import { LoginFormData } from "@/app/_types/formTypes";
import AppLogoLink from "../_components/AppLogoLink";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>();

  /**
   * ログイン処理を行う
   */
  const handleLogin = async (email: string, password: string) => {
    console.log("ログイン処理開始", { email, rememberMe });

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ クッキー送受信に必須
        body: JSON.stringify({ email, password, rememberMe }),
      });

      // 期待するレスポンス形式の確認
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("❌ 不正なレスポンス形式:", contentType);
        setError("サーバーエラーが発生しました");
        return null;
      }

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ 認証エラー:", result.message);
        if (result.message === "Email not confirmed") {
          setError(
            "メールアドレスが未確認です。確認メールを開封してください。"
          );
        } else {
          setError(result.message || "ログインに失敗しました");
        }
        return null;
      }

      // エラーなし → ログイン成功
      setError(null);
      return true;
    } catch (err) {
      console.error("❌ ログイン処理失敗:", err);
      setError("予期せぬエラーが発生しました");
      return null;
    }
  };

  /**
   * 確認メールの再送処理
   */
  const resendVerificationEmail = async () => {
    const email = getValues("email");

    const response = await fetch("/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert("確認メールの再送信に失敗しました: " + result.message);
    } else {
      setEmailSent(true);
      alert("確認メールを再送信しました。");
    }
  };

  /**
   * フォーム送信処理
   */
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    const user = await handleLogin(data.email, data.password);
    setIsSubmitting(false);

    if (user) {
      // ✅ ログイン直後は少し待機してからセッション取得
      await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms待機

      const sessionResponse = await fetch("/api/session", {
        method: "GET",
        credentials: "include",
      });

      if (sessionResponse.ok) {
        router.push("/user/dashboard");
      } else {
        console.warn("❌ セッション取得失敗:", await sessionResponse.text());
        setError("セッション情報の取得に失敗しました");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-6"
      >
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className={`h-10 ${errors.password ? "border-red-500" : ""}`}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* ログイン状態保持 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
              disabled={isSubmitting}
              className="accent-pink-500"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-700">
              ログイン状態を保持する
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-pink-500 text-white hover:bg-pink-600"
        >
          {isSubmitting ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </div>
  );
}
