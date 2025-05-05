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

// 2つの日付の差分（日数）を返す
export const getDateDiffInDays = (date1: Date, date2: Date): number =>
  Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
