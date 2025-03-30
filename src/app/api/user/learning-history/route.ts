import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/app/_utils/supabase";
import { prisma } from "@/app/_utils/prisma";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    // リクエストヘッダーからトークンを取得
    const authorizationHeader = req.headers["authorization"];

    if (typeof authorizationHeader !== "string") {
      console.error("Authorization header is missing or invalid");
      return res
        .status(401)
        .json({ message: "Authorization header is missing or invalid" });
    }

    const token = authorizationHeader.split("Bearer ")[1]; // "Bearer " の後ろの部分を抽出

    console.log("Received token:", token); // トークンをログに表示

    if (!token) {
      console.error("Token is missing");
      return res.status(401).json({ message: "トークンがありません" });
    }

    // Supabaseでトークンを検証
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      console.error("Invalid token", error?.message);
      return res.status(401).json({ message: "トークンが無効です" });
    }

    const userId = data.user.id;
    console.log("Authenticated user ID:", userId); // 認証されたユーザーIDをログに表示

    // リクエストボディから学習記録のデータを取得
    const { categoryId, title, date, startTime, endTime, duration, content } =
      req.body;

    if (
      !categoryId ||
      !title ||
      !date ||
      !startTime ||
      !endTime ||
      !duration ||
      !content
    ) {
      return res
        .status(400)
        .json({ message: "必須のフィールドが不足しています" });
    }

    // 新しい学習記録をデータベースに保存
    const newRecord = await prisma.learningRecord.create({
      data: {
        supabaseUserId: userId, // SupabaseのユーザーIDを使用
        categoryId,
        title,
        learning_date: new Date(date),
        start_time: new Date(`2000-01-01T${startTime}:00`),
        end_time: new Date(`2000-01-01T${endTime}:00`),
        duration: parseFloat(duration),
        content,
      },
    });

    // 成功した場合は新しいレコードを返す
    return res.status(200).json(newRecord); // ここでレスポンスを返す
  } catch (error) {
    console.error("Error creating learning record:", error);
    return res.status(500).json({ message: "学習記録の保存に失敗しました" });
  }
}
