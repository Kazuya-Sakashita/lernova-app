"use client";

import { useForm } from "react-hook-form";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";

type FormData = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  profile_picture: string;
  bio: string;
  phoneNumber: string;
  socialLinks: string;
};

// TODO デザイン、コンポーネントか含め、別途修正予定
export default function ProfileRegistrationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("プロフィールデータ:", data);
    // プロフィール登録ロジックをここに追加
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-bold text-pink-600">
            プロフィールを完成させてください
          </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-pink-600">
              名
            </Label>
            <Input
              id="first_name"
              placeholder="名を入力してください"
              {...register("first_name", { required: "名は必須です" })}
              className={`border-pink-600 text-gray-700 ${
                errors.first_name ? "border-red-500" : ""
              }`}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-pink-600">
              姓
            </Label>
            <Input
              id="last_name"
              placeholder="姓を入力してください"
              {...register("last_name", { required: "姓は必須です" })}
              className={`border-pink-600 text-gray-700 ${
                errors.last_name ? "border-red-500" : ""
              }`}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-pink-600">
              生年月日
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth", { required: "生年月日は必須です" })}
              className={`border-pink-600 text-gray-700 ${
                errors.date_of_birth ? "border-red-500" : ""
              }`}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-500">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-pink-600">
              性別
            </Label>
            <Select
              {...register("gender", { required: "性別は必須です" })}
              onValueChange={(value) => setValue("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="性別を選んでください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男性</SelectItem>
                <SelectItem value="female">女性</SelectItem>
                <SelectItem value="other">その他</SelectItem>
                <SelectItem value="prefer_not_to_say">答えたくない</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-sm text-red-500">{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_picture" className="text-pink-600">
              プロフィール画像URL
            </Label>
            <Input
              id="profile_picture"
              placeholder="プロフィール画像のURLを入力してください"
              {...register("profile_picture")}
              className="border-pink-600 text-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-pink-600">
              自己紹介
            </Label>
            <Textarea
              id="bio"
              placeholder="自己紹介を入力してください"
              {...register("bio")}
              className="border-pink-600 text-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-pink-600">
              電話番号
            </Label>
            <Input
              id="phoneNumber"
              placeholder="電話番号を入力してください"
              {...register("phoneNumber")}
              className="border-pink-600 text-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialLinks" className="text-pink-600">
              SNSリンク
            </Label>
            <Input
              id="socialLinks"
              placeholder="SNSリンクを入力してください"
              {...register("socialLinks")}
              className="border-pink-600 text-gray-700"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 text-white hover:bg-pink-700"
          >
            登録を完了する
          </Button>
        </form>
      </div>
    </div>
  );
}
