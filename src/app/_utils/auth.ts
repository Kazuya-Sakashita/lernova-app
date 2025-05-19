import { supabase } from "@utils/supabase";
import { NextRequest } from "next/server";

export async function getCurrentUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return { error: "トークンがありません", data: null };
  }

  const { data, error } = await supabase.auth.getUser(token);
  return { data, error };
}
