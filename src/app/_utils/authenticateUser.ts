import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/_utils/jwt"; // jwt.tsからインポート

// 認証ミドルウェア
const authenticateUser = async (req: NextRequest) => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", ""); // ヘッダーからトークンを取得

  if (!token) {
    return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
  }

  const decoded = verifyToken(token); // トークンを検証
  if (!decoded || !decoded.sub) {
    // decoded.sub が undefined でないか確認
    return NextResponse.json(
      { message: "無効なトークンです" },
      { status: 401 }
    );
  }

  // decoded.sub が関数かどうかを確認し、関数であれば実行して値を取得
  const userId =
    typeof decoded.sub === "function" ? decoded.sub() : decoded.sub;

  // リクエストに userId を追加
  req.userId = userId;

  // 認証が成功した場合、次の処理へ進む
  return null; // 認証成功なら何も返さず、次の処理に進む
};

export { authenticateUser };
