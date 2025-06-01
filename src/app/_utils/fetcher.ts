export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include", // ✅ クッキーを送る（認証情報付き）
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!res.ok) {
    const err = isJson
      ? await res.json().catch(() => ({ message: res.statusText }))
      : { message: res.statusText };

    console.error("❌ fetch エラー:", err);
    throw new Error(err.message || "データ取得に失敗しました");
  }

  return isJson ? res.json() : null;
};
