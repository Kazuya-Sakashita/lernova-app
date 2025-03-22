import { supabase } from "@/app/_utils/supabase";
import { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null); // 初期値を null に変更
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setToken(session?.access_token || null);
      setIsLoading(false);
    };

    fetchSession();

    // セッションの変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
        setToken(session?.access_token || null);
      }
    );

    // コンポーネントがアンマウントされる際にリスナーを解除
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { session, isLoading, token };
};
