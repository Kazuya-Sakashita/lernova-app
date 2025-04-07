import jwt from "jsonwebtoken";

// JWTのシークレットキー（本番環境では環境変数にする）
const SECRET_KEY = process.env.JWT_SECRET_KEY || "your_secret_key";

// JWTトークンを生成する関数
export const generateToken = (userId: string) => {
  return jwt.sign({ sub: userId }, SECRET_KEY, { expiresIn: "1h" }); // 有効期限1時間
};

// JWTトークンを検証する関数
export const verifyToken = (token: string) => {
  try {
    // トークンを検証してデコード
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded JWT:", decoded); // トークンが検証された場合、デコード結果を出力
    return decoded;
  } catch (error) {
    // エラーが発生した場合、詳細なエラーメッセージを出力
    console.error("JWTトークン検証エラー:", error);
    return null; // 無効なトークンの場合はnullを返す
  }
};
