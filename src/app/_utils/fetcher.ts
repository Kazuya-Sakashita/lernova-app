// フェッチ関数（共通）

export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("API error");
    return res.json();
  });
