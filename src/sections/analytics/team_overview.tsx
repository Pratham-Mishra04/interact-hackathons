import React, { ReactNode, useEffect, useState } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import TimeProgressGraph from '@/components/common/time_graph';
import moment from 'moment';
import { HackathonRound } from '@/types';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';

const initialChartData = [
  { time: '5 Days Ago', noOfTeams: 0, noOfParticipants: 0 },
  { time: '4 Days Ago', noOfTeams: 0, noOfParticipants: 0 },
  { time: '3 Days Ago', noOfTeams: 0, noOfParticipants: 0 },
  { time: '2 Days Ago', noOfTeams: 0, noOfParticipants: 0 },
  { time: '1 Day Ago', noOfTeams: 0, noOfParticipants: 0 },
  { time: 'Today', noOfTeams: 0, noOfParticipants: 0 },
];

const chartConfig = {
  noOfTeams: {
    label: 'Teams',
    color: '#2563eb',
  },
  noOfParticipants: {
    label: 'Participants',
    color: '#10b981',
  },
} satisfies ChartConfig;

const TeamOverviewAnalytics = ({ nextRound }: { nextRound?: HackathonRound | null }) => {
  const [chartData, setChartData] = useState(initialChartData);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [totalPrize, setTotalPrize] = useState(0);

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const res = await getHandler(`/hackathons/${hackathon.id}/participants/analytics/team`);
      if (res.statusCode == 200) {
        setChartData(res.data.data);
        setTotalTeams(res.data.totalTeams);
        setTotalParticipants(res.data.totalParticipants);
        setTotalTracks(res.data.totalTracks);
        setTotalPrize(res.data.totalPrize);
      } else {
        Toaster.error(res.data?.message || SERVER_ERROR);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
      <AnalyticBox className="hidden md:block">
        <div className="flex flex-col gap-0">
          <span className="flex items-center text-xs font-medium justify-between">
            <h1 className="uppercase text-black/70">Teams</h1>
          </span>
          <h1 className="text-xl font-semibold">{totalTeams}</h1>
        </div>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="noOfTeams" fill="var(--color-noOfTeams)" radius={4} />
          </BarChart>
        </ChartContainer>
      </AnalyticBox>
      <AnalyticBox className="hidden md:block">
        <div className="flex flex-col gap-0">
          <span className="flex items-center text-xs font-medium justify-between">
            <h1 className="uppercase text-black/70">Participants</h1>
          </span>
          <h1 className="text-xl font-semibold">{totalParticipants}</h1>
        </div>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="noOfParticipants" fill="var(--color-noOfParticipants)" radius={4} />
          </BarChart>
        </ChartContainer>
      </AnalyticBox>

      {nextRound ? (
        <TimeProgressGraph
          time1={moment(hackathon.teamFormationEndTime)}
          time2={moment(nextRound.startTime)}
          innerRadius={80}
          outerRadius={140}
          height={140}
        />
      ) : (
        <TimeProgressGraph
          time1={moment(hackathon.teamFormationStartTime)}
          time2={moment(hackathon.teamFormationEndTime)}
          innerRadius={80}
          outerRadius={140}
          height={140}
        />
      )}

      <div className="w-full grid grid-cols-2 gap-2">
        <AnalyticBox className="flex flex-col  justify-between">
          <span>
            <h2 className=" text-sm font-semibold text-black">Number of Tracks</h2>
            <h1 className="text-4xl font-semibold">{totalTracks}</h1>
          </span>
          {/* <span className="text-xs text-primary_text font-medium">3 Sponsor tracks</span> */}
        </AnalyticBox>
        <AnalyticBox className="flex flex-col gap-2 justify-between">
          <span>
            <h2 className="text-sm font-semibold text-black">Prize Pool</h2>
            <h1 className="text-4xl font-semibold">
              {totalPrize > 1000 ? `${Math.floor(totalPrize / 1000)}k` : totalPrize == 0 ? 'NA' : totalPrize}
            </h1>
          </span>
          {/* <span className="text-xs text-primary_text font-medium">Cash+Goodies</span> */}
        </AnalyticBox>
      </div>
    </div>
  );
};

export default TeamOverviewAnalytics;

type BoxProps = {
  children: ReactNode;
  className?: string;
  styles?: React.CSSProperties;
};
export function AnalyticBox({ children, className, styles }: BoxProps) {
  return (
    <div style={styles} className={`p-4 bg-white rounded-lg w-full ${className}`}>
      {children}
    </div>
  );
}
