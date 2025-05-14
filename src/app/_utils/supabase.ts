import { createClient } from "@supabase/supabase-js";

const getStorage = () => {
  if (typeof window === "undefined") return undefined;
  const persist = localStorage.getItem("persistLogin");
  return persist === "true" ? localStorage : sessionStorage;
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: typeof window !== "undefined" ? getStorage() : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
