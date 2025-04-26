"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { HeatmapCalendar } from "@/app/_components/heatmap-calendar";

interface Props {
  data: { date: Date; hours: number }[];
}

const HeatmapSection = ({ data }: Props) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>学習カレンダー</CardTitle>
      <CardDescription>過去3ヶ月間の学習時間</CardDescription>
    </CardHeader>
    <CardContent className="pt-6 overflow-x-auto">
      <div className="min-w-[800px] md:min-w-0 px-4">
        <HeatmapCalendar data={data} />
      </div>
    </CardContent>
  </Card>
);

export default HeatmapSection;
