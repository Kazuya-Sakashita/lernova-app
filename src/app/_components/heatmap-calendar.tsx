"use client"
import { format, subDays, isSameDay, startOfWeek, addDays } from "date-fns"
import React from "react"

import { ja } from "date-fns/locale"

interface HeatmapCalendarProps {
  data: {
    date: Date
    hours: number
  }[]
}

export function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const today = new Date()
  const threeMonthsAgo = subDays(today, 90)
  const startDate = startOfWeek(threeMonthsAgo, { weekStartsOn: 1 }) // 月曜日から開始

  const getIntensity = (hours: number) => {
    if (hours === 0) return "bg-gray-100"
    if (hours < 1) return "bg-pink-100"
    if (hours < 2) return "bg-pink-200"
    if (hours < 3) return "bg-pink-300"
    if (hours < 4) return "bg-pink-400"
    return "bg-pink-500"
  }

  // 週ごとのデータを生成
  const weeks = []
  let currentDate = startDate

  while (currentDate <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(currentDate)
      currentDate = addDays(currentDate, 1)
    }
    weeks.push(week)
  }

  // 2列に分割
  const halfLength = Math.ceil(weeks.length / 2)
  const leftColumn = weeks.slice(0, halfLength)
  const rightColumn = weeks.slice(halfLength)

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* 左列 */}
      <div className="flex-1">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
          <div className="h-6" /> {/* 日付ラベル用の空白 */}
          {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
            <div key={i} className="h-6 text-xs text-gray-500 text-center">
              {day}
            </div>
          ))}
          {leftColumn.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div className="text-xs text-gray-500 pr-2 text-right">{format(week[0], "M/d", { locale: ja })}</div>
              {week.map((day, dayIndex) => {
                const dayData = data.find((d) => isSameDay(d.date, day))
                const hours = dayData ? dayData.hours : 0
                return (
                  <div
                    key={dayIndex}
                    className={`aspect-square ${getIntensity(hours)} rounded-sm transition-colors duration-200 hover:opacity-80`}
                    title={`${format(day, "yyyy/MM/dd")}: ${hours.toFixed(1)}時間`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 右列 */}
      <div className="flex-1">
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1">
          <div className="h-6" /> {/* 日付ラベル用の空白 */}
          {["月", "火", "水", "木", "金", "土", "日"].map((day, i) => (
            <div key={i} className="h-6 text-xs text-gray-500 text-center">
              {day}
            </div>
          ))}
          {rightColumn.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              <div className="text-xs text-gray-500 pr-2 text-right">{format(week[0], "M/d", { locale: ja })}</div>
              {week.map((day, dayIndex) => {
                const dayData = data.find((d) => isSameDay(d.date, day))
                const hours = dayData ? dayData.hours : 0
                return (
                  <div
                    key={dayIndex}
                    className={`aspect-square ${getIntensity(hours)} rounded-sm transition-colors duration-200 hover:opacity-80`}
                    title={`${format(day, "yyyy/MM/dd")}: ${hours.toFixed(1)}時間`}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

