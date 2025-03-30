"use client";

import React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// 1日のデータ型を定義
interface Day {
  date: Date; // 日付
  hasRecord: boolean; // 学習記録があるかどうか
}

// 1週間のデータ型を定義
interface Week {
  weekStart: Date; // 週の開始日
  days: Day[]; // 1週間分の日付と記録の有無
}

// カレンダーのデータ型を定義
interface CalendarProps {
  calendarData: Week[]; // 週単位のカレンダーデータ
}

// Calendarコンポーネントの定義
const Calendar: React.FC<CalendarProps> = ({ calendarData }) => {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
        <div className="h-6" /> {/* 日曜日〜土曜日のヘッダー用の空白セル */}
        {/* 曜日ラベル */}
        {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
          <div key={i} className="h-6 text-xs text-gray-500 text-center">
            {day} {/* 曜日を表示 */}
          </div>
        ))}
        {/* 各週のデータをマッピングして表示 */}
        {calendarData.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {/* 週の開始日を表示 */}
            <div className="text-xs text-gray-500 pr-2 text-right">
              {format(week.weekStart, "M/d", { locale: ja })}{" "}
              {/* 週の開始日をフォーマットして表示 */}
            </div>

            {/* 各日のデータをマッピングして表示 */}
            {week.days.map((day: Day, dayIndex: number) => (
              <div
                key={dayIndex}
                className={`aspect-square ${
                  day.hasRecord ? "bg-pink-300" : "bg-gray-100" // 学習記録がある場合はピンク色、ない場合はグレー
                } rounded-sm transition-colors duration-200 hover:opacity-80`}
                title={format(day.date, "yyyy/MM/dd")} // 日付を表示するツールチップ
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
