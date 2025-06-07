"use client";
// TODO リファクタリング必要
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@ui/avatar";
import { Upload } from "lucide-react";
import { Separator } from "@ui/separator";
import { Textarea } from "@ui/textarea";
import useUserProfile from "@/app/user/profile/_hooks/useUserProfile"; // useUserProfile フックをインポート
import { useRouter } from "next/navigation";

// フォームのバリデーションスキーマ
const formSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: "ニックネームは2文字以上である必要があります" })
    .max(50, { message: "ニックネームは50文字以下である必要があります" }),
  first_name: z
    .string()
    .min(2, { message: "名は2文字以上である必要があります" })
    .max(50, { message: "名は50文字以下である必要があります" }),
  last_name: z
    .string()
    .min(2, { message: "姓は2文字以上である必要があります" })
    .max(50, { message: "姓は50文字以下である必要があります" }),
  gender: z.string().optional(), // 性別はオプショナル
  bio: z
    .string()
    .max(500, { message: "自己紹介は500文字以下である必要があります" })
    .optional(),
  phoneNumber: z
    .string()
    .max(15, { message: "電話番号は15文字以内である必要があります" })
    .optional(),
  socialLinks: z
    .string()
    .max(255, { message: "SNSリンクは255文字以内である必要があります" })
    .optional(),
  pushNotifications: z.boolean().default(false),
  date_of_birth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "誕生日を正しい日付形式で入力してください。",
    })
    .optional(),
});

// フォームの値の型
type FormValues = z.infer<typeof formSchema>;

export default function ProfileForm() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profileData, isLoading } = useUserProfile(); // useUserProfile フックを使用
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), // Zodを使ってバリデーション
    defaultValues: {
      nickname: profileData?.nickname || "",
      first_name: profileData?.first_name || "",
      last_name: profileData?.last_name || "",
      gender: profileData?.gender || "",
      bio: profileData?.bio || "",
      phoneNumber: profileData?.phoneNumber || "",
      socialLinks: profileData?.socialLinks || "",
      pushNotifications: profileData?.pushNotifications || false,
      date_of_birth: profileData?.date_of_birth || "",
    },
  });

  // ユーザープロフィールデータのセット
  useEffect(() => {
    if (profileData) {
      form.setValue("nickname", profileData.nickname || "");
      form.setValue("first_name", profileData.first_name || "");
      form.setValue("last_name", profileData.last_name || "");
      form.setValue("gender", profileData.gender || "");
      form.setValue("bio", profileData.bio || "");
      form.setValue("phoneNumber", profileData.phoneNumber || "");
      form.setValue("socialLinks", profileData.socialLinks || "");
      form.setValue(
        "date_of_birth",
        profileData.date_of_birth
          ? new Date(profileData.date_of_birth).toISOString().split("T")[0]
          : ""
      );
      if (profileData.profile_picture) {
        setProfileImage(profileData.profile_picture); // プロフィール画像の設定
      }
    }
  }, [profileData, form]);

  // プロフィール画像のアップロード処理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // フォーム送信処理
  // フォーム送信処理
  const handleSubmit = async (data: FormValues & { profileImage?: string }) => {
    setIsSubmitting(true);
    const finalProfileImage = profileImage || "";

    try {
      const res = await fetch("/api/user/profile/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ クッキーによるセッション情報を送信
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          gender: data.gender,
          bio: data.bio,
          phoneNumber: data.phoneNumber,
          socialLinks: data.socialLinks,
          profile_picture: finalProfileImage,
          date_of_birth: data.date_of_birth,
          nickname: data.nickname,
        }),
      });

      if (!res.ok) {
        console.error("レスポンスエラー:", res);
        throw new Error("プロフィール保存に失敗しました");
      }

      alert("プロフィールが正常に更新されました！");
    } catch (error) {
      console.error("エラーが発生しました:", error);
      alert("プロフィール保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-semibold text-pink-600">
          {form.watch("nickname") ? `${form.watch("nickname")}さんの` : ""}
          プロフィール設定
        </CardTitle>
        <CardDescription className="text-gray-600">
          あなたのプロフィール情報を登録・更新してください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-8"
          >
            {/* プロフィール画像 */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-pink-500">
                  <AvatarImage
                    src={profileImage || "/default-avatar.png"}
                    alt="プロフィール画像"
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-muted">
                    <span className="text-gray-500">👤</span>
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-pink-600">
                      <Upload size={16} />
                      <span>画像をアップロード</span>
                    </div>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF形式の画像（最大5MB）
                </p>
              </div>

              <div className="flex-1 space-y-4 w-full">
                {/* フォーム項目: ニックネーム */}
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600">
                        ニックネーム <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ニックネームを入力"
                          {...field}
                          className="border-pink-600 text-gray-700 focus:ring-pink-500"
                        />
                      </FormControl>
                      <FormDescription>
                        他のユーザーに表示される名前です。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 姓 */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600">
                        姓 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="姓を入力"
                          {...field}
                          className="border-pink-600 text-gray-700 focus:ring-pink-500"
                        />
                      </FormControl>
                      <FormDescription>
                        あなたの姓を入力してください。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 名 */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600">
                        名 <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="名を入力"
                          {...field}
                          className="border-pink-600 text-gray-700 focus:ring-pink-500"
                        />
                      </FormControl>
                      <FormDescription>
                        あなたの名を入力してください。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 性別 */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600">性別</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={profileData?.gender || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-pink-600 text-gray-700 focus:ring-pink-500">
                            <SelectValue placeholder="性別を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">男性</SelectItem>
                          <SelectItem value="female">女性</SelectItem>
                          <SelectItem value="other">その他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        任意の項目です。回答しなくても構いません。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 誕生日 */}
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-pink-600">誕生日</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field} // formにバインディングされたvalueとonChangeが自動的に適用されます
                          className="border-pink-600 text-gray-700 focus:ring-pink-500"
                        />
                      </FormControl>
                      <FormDescription>
                        あなたの生年月日を入力してください。
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* 自己紹介 */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-pink-600">自己紹介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="あなた自身について簡単に紹介してください"
                      className="resize-none min-h-[120px] border-pink-600 text-gray-700 focus:ring-pink-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    あなたのプロフィールページに表示されます。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 電話番号 */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-pink-600">電話番号</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="電話番号を入力"
                      className="border-pink-600 text-gray-700 focus:ring-pink-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    あなたの連絡先電話番号を入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SNSリンク */}
            <FormField
              control={form.control}
              name="socialLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-pink-600">SNSリンク</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SNSプロフィールリンク"
                      className="border-pink-600 text-gray-700 focus:ring-pink-500"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    SNSアカウントのリンクを入力してください。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 flex justify-between">
              <Button
                variant="outline"
                type="button"
                className="text-pink-600"
                onClick={() => router.push("/user/dashboard")}
              >
                キャンセル
              </Button>
              <Button
                type="submit" // ボタンの type は必ず "submit" にする
                disabled={isSubmitting}
                className="bg-pink-600 text-white hover:bg-pink-700"
              >
                {isSubmitting ? "保存中..." : "保存する"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
