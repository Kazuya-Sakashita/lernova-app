import { toZonedTime } from "date-fns-tz"; // タイムゾーン変換
import { format } from "date-fns"; // フォーマット変換

// UTCから日本時間 (Asia/Tokyo) への変換
const convertToJSTDate = (utcDate: string): Date => {
  const date = new Date(utcDate); // UTCをDateオブジェクト作成
  if (isNaN(date.getTime())) {
    throw new Error(`無効なUTC日付が渡されました: ${utcDate}`);
  }
  return toZonedTime(date, "Asia/Tokyo"); // UTCから日本時間に変換
};

// 日本時間 (Asia/Tokyo) から UTC への変換
export const convertToUTC = (date: string, time: string): string => {
  const dateTime = new Date(`${date}T${time}:00`); // dateとtimeを統合してDateオブジェクト作成
  const zonedTime = toZonedTime(dateTime, "Asia/Tokyo"); // 日本時間を取得
  return zonedTime.toISOString(); // UTCに変換
};

// UTCから日本時間 (Asia/Tokyo) への変換 (日付と時間)
export const convertToJST = (utcDate: string): string => {
  const zonedTime = convertToJSTDate(utcDate); // UTCを日本時間に変換
  return format(zonedTime, "yyyy-MM-dd HH:mm:ss zzz"); // フォーマット
};

// 日本時間から時間部分 (HH:mm) を抽出する関数
export const extractTime = (utcDate: string): string => {
  console.log("extractTime関数が呼び出されました"); // デバッグ用
  console.log("utcDate:", utcDate); // デバッグ用
  const zonedTime = convertToJSTDate(utcDate); // UTCを日本時間に変換
  return format(zonedTime, "HH:mm"); // 時間部分のみ取得
};

// 日本時間から日付部分 (yyyy-MM-dd) を抽出する関数
export const extractDateFromUTC = (utcDate: string): string => {
  const zonedTime = convertToJSTDate(utcDate); // UTCを日本時間に変換
  return format(zonedTime, "yyyy-MM-dd"); // 日付部分のみ取得
};
