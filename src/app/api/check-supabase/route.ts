import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 環境変数をコンソールに出力して確認
console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function GET() {
  try {
    // Supabase からデータ取得の確認
    const { data, error } = await supabase
      .from("User") // スキーマを明示的に指定
      .select("*");
    // ここでテーブルを指定

    if (error) {
      console.error("Supabase Error:", error.message); // エラーメッセージを詳細に出力
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    console.log("Supabase Data:", data); // 取得したデータをログに出力
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Supabase connection failed:", error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      console.error("Unknown error occurred:", error);
      return NextResponse.json(
        { message: "Unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
