import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@utils/supabase"; // Supabaseのクライアントをインポート

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers["authorization"]?.split("Bearer ")[1]; // Authorizationヘッダーからトークンを取得

  if (!token) {
    return res.status(401).json({ message: "トークンがありません" }); // トークンがない場合
  }

  try {
    // Supabaseでトークンを検証
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data) {
      return res.status(401).json({ message: "トークンが無効です" }); // トークンが無効な場合
    }

    // トークンが有効な場合
    res.status(200).json({ user: data });
  } catch (error) {
    return res.status(500).json({ message: "サーバーエラー", error });
  }
}
