"use client";

import { supabase } from "@utils/supabase";
import { useForm } from "react-hook-form";
import { Label } from "@ui/label";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { SignUpFormData } from "@/app/_types/formTypes";
import AppLogoLink from "../_components/AppLogoLink";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError, // setError を使用する
    watch,
  } = useForm<SignUpFormData>();

  const onSubmit = async (data: SignUpFormData) => {
    const { email, password, nickname } = data;

    // Supabase 認証のサインアップ
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          emailRedirectTo: `http://localhost:3000/login`, // メール確認後のリダイレクトURL
        },
      }
    );

    console.log("SignUp Data:", signUpData); // サインアップデータの確認用ログ
    console.log("SignUp Error:", signUpError); // サインアップエラーの確認用ログ

    if (signUpError) {
      console.error("SignUp Error:", signUpError.message);
      alert("登録に失敗しました");
    } else {
      const user = signUpData?.user; // auth.users からユーザーを取得
      console.log("User created: ", user); // ユーザー情報の確認用ログ

      // サインアップが成功した場合、Userテーブルにニックネームを保存
      if (user) {
        // ユーザー情報をサーバーサイドで保存するAPIを呼び出す
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            nickname,
            supabaseUserId: user.id, // supabaseUserIdを追加
          }),
        });

        if (response.ok) {
          alert(
            "確認メールを送信しました。メールを確認して、リンクをクリックしてください。"
          );
        } else {
          console.error("ユーザー情報の保存に失敗しました");
        }
      }
    }
  };

  // パスワード確認のバリデーション
  const validateConfirmPassword = (value: string) => {
    const password = watch("password");
    if (password !== value) {
      setError("confirmPassword", {
        type: "manual",
        message: "パスワードが一致しません",
      });
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen">
      {/* アプリロゴ */}
      <AppLogoLink
        href="/" // リンク先
        logoText="Lernova" // ロゴのテキスト
        textColor="text-pink-500"
        textSize="text-xl"
        iconColor="text-pink-500"
        bgColor="bg-pink-50"
      />
      <h1 className="text-xl font-semibold text-center mb-1">アカウント作成</h1>
      <p className="text-center text-gray-600 text-sm mb-6">
        必要な情報を入力して登録を完了してください
      </p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto space-y-4"
      >
        <div className="space-y-1">
          <Label htmlFor="nickname" className="text-sm font-medium">
            ニックネーム
          </Label>
          <Input
            id="nickname"
            {...register("nickname", { required: "ニックネームは必須です" })}
            type="text"
            placeholder="例：Lernova太郎"
            className={`h-10 ${errors.nickname ? "border-red-500" : ""}`}
          />
          {errors.nickname && (
            <p className="text-sm text-red-500">{errors.nickname.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm font-medium">
            メールアドレス
          </Label>
          <Input
            id="email"
            {...register("email", {
              required: "メールアドレスは必須です",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "無効なメールアドレスです",
              },
            })}
            type="email"
            placeholder="name@example.com"
            className={`h-10 ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password" className="text-sm font-medium">
            パスワード
          </Label>
          <Input
            id="password"
            {...register("password", {
              required: "パスワードは必須です",
              minLength: {
                value: 8,
                message: "パスワードは8文字以上である必要があります",
              },
            })}
            type="password"
            placeholder="8文字以上で入力"
            className={`h-10 ${errors.password ? "border-red-500" : ""}`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            パスワード（確認）
          </Label>
          <Input
            id="confirmPassword"
            {...register("confirmPassword", {
              required: "パスワード確認は必須です",
              validate: validateConfirmPassword,
            })}
            type="password"
            placeholder="パスワードを再入力"
            className={`h-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-10 bg-pink-500 hover:bg-pink-600"
        >
          アカウントを作成
        </Button>
      </form>
    </div>
  );
}
