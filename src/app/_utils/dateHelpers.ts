import { format, subDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const JST = "Asia/Tokyo";

// JSTで日付を "yyyy-MM-dd" 形式に変換
export const formatDateJST = (date: Date): string => {
  return format(toZonedTime(date, JST), "yyyy-MM-dd");
};

// 過去n日分のJST日付（"yyyy-MM-dd"）を配列で取得
export const getPastNDatesJST = (
  n: number,
  from: Date = new Date()
): string[] => {
  return Array.from({ length: n }, (_, i) => formatDateJST(subDays(from, i)));
};

// 2つの日付の差分（日数）を返す（JST変換後に比較）
export const getDateDiffInDays = (date1: Date, date2: Date): number => {
  const jstDate1 = toZonedTime(date1, JST);
  const jstDate2 = toZonedTime(date2, JST);
  const diffMs = jstDate1.getTime() - jstDate2.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
