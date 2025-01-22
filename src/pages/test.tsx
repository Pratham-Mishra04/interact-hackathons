import { Check } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import Masonry from 'react-masonry-css';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import moment from 'moment';

const Test = () => {
  const start = moment().subtract(10, 'hour');
  const judgingStart = moment().add(1, 'day');
  const end = moment().add(2, 'day').subtract(1, 'hour');

  const now = moment();

  const timeLeft = moment.duration(end.diff(now));

  const totalDuration = end.diff(start);
  const elapsedDuration = now.diff(start);
  const progressAngle = Math.max(0, Math.min(360, 360 - (elapsedDuration / totalDuration) * 360));

  const chartData = [
    {
      judging: Math.max(0, end.diff(judgingStart)),
      round: Math.max(0, judgingStart.diff(now)),
    },
  ];

  const chartConfig = {
    judging: {
      label: 'Judging Time',
      color: 'hsl(var(--chart-2))',
    },
    round: {
      label: 'Round Time',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-screen bg-sky-200 flex justify-center pt-32">
      <div>
        <div className="w-full flex gap-2">
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-bl-none flex items-center justify-between px-4">
            <div className="text-xl font-medium">Track Prize</div>
            <Check size={32} />
          </div>
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-br-none flex items-center justify-between px-4">
            <Check size={32} />
            <div className="text-xl font-medium">Teams Left</div>
          </div>
        </div>
        <Masonry breakpointCols={{ default: 4 }} className="w-[28rem] masonry-grid" columnClassName="masonry-grid_column">
          <div className="w-full h-24 bg-white rounded-b-lg">10k</div>
          <div className="w-[calc(200%-16px)] h-48 bg-white rounded-lg m-2">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px]">
              <RadialBarChart data={chartData} endAngle={progressAngle} innerRadius={80} outerRadius={130}>
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan x={viewBox.cx} y={viewBox.cy || 0} className="fill-foreground text-2xl font-bold">
                              {timeLeft.humanize()}
                            </tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground">
                              Left
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar dataKey="judging" fill="var(--color-judging)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                <RadialBar dataKey="round" stackId="a" cornerRadius={5} fill="var(--color-round)" className="stroke-transparent stroke-2" />
              </RadialBarChart>
            </ChartContainer>
          </div>
          <div></div>
          <div className="w-full h-24 bg-white rounded-b-lg">22</div>
          <div className="w-full h-[6.5rem] bg-white rounded-t-lg mt-2"></div>
          <div></div>
          <div></div>
          <div className="w-full h-[6.5rem] bg-white rounded-t-lg mt-2"></div>
        </Masonry>
        <div className="w-full flex gap-2">
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-tl-none"></div>
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-tr-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Test;
