// 棒グラフ（LearningProgressChart）用のデータ型
export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

// 円グラフ（CategoryChart）用のデータ型
export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}
