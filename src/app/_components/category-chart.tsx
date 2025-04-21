"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"

interface CategoryChartProps {
  data: {
    labels: string[]
    datasets: {
      data: number[]
      backgroundColor: string[]
    }[]
  }
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const pinkPalette = [
          "rgba(236, 72, 153, 0.8)",
          "rgba(244, 114, 182, 0.8)",
          "rgba(251, 207, 232, 0.8)",
          "rgba(249, 168, 212, 0.8)",
          "rgba(236, 72, 153, 0.6)",
        ]

        const config: ChartConfiguration = {
          type: "pie",
          data: {
            ...data,
            datasets: data.datasets.map((dataset) => ({
              ...dataset,
              backgroundColor: pinkPalette,
            })),
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "right",
              },
              title: {
                display: true,
                text: "カテゴリ別学習時間",
              },
            },
          },
        }

        chartInstance.current = new Chart(ctx, config)
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

