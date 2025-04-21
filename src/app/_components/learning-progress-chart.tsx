"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"

interface LearningProgressChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }
}

export function LearningProgressChart({ data }: LearningProgressChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d")

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const config: ChartConfiguration = {
          type: "bar",
          data: {
            ...data,
            datasets: data.datasets.map((dataset) => ({
              ...dataset,
              backgroundColor: "rgba(236, 72, 153, 0.6)", // ピンク系の色に変更
            })),
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: "週間学習時間",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "学習時間 (時間)",
                },
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

