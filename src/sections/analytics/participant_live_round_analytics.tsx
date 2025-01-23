import React, { useEffect, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { Announcement, HackathonRound } from '@/types';
import TimeProgressGraph from '@/components/common/time_graph';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import Masonry from 'react-masonry-css';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Blueprint, Check, FigmaLogo, GithubLogo, Users } from '@phosphor-icons/react';
import AnnouncementCard from '@/components/announcement_card';
import { formatPrice } from '@/utils/funcs/misc';

export default function ParticipantLiveRoundAnalytics({
  teamID,
  currentRound,
  nextRound,
}: {
  teamID: string;
  currentRound: HackathonRound | null;
  nextRound: HackathonRound | null;
}) {
  const [analyticsData, setAnalyticsData] = useState({
    figmaHistoriesPercentageChange: 0,
    githubCommitPercentageChange: 0,
    maxActivityCount: 0,
    minActivityCount: 0,
    teamsLeftInTrack: 0,
    totalActivityCount: 0,
    totalFigmaHistories: 0,
    totalGithubCommits: 0,
    trackPrize: 0,
  });
  const [roundTimeData, setRoundTimeData] = useState({
    progressAngle: 0,
    timeLeft: '',
    chatData: [
      {
        judging: 0,
        round: 0,
      },
    ],
  });

  useEffect(() => {
    const start = moment(currentRound?.startTime);
    const judgingStart = moment(currentRound?.judgingStartTime);
    const end = moment(currentRound?.endTime);

    const now = moment();

    const timeLeft = moment.duration(end.diff(now)).humanize();

    const totalDuration = end.diff(start);
    const elapsedDuration = now.diff(start);
    const progressAngle = Math.max(0, Math.min(360, 360 - (elapsedDuration / totalDuration) * 360));

    const chartData = [
      {
        judging: Math.max(0, end.diff(judgingStart, 'minutes')),
        round: Math.max(0, judgingStart.diff(now, 'minutes')),
      },
    ];

    setRoundTimeData({
      progressAngle,
      timeLeft,
      chatData: chartData,
    });
  }, [teamID, currentRound, nextRound]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const res = await getHandler(`/hackathons/${hackathon.id}/participants/analytics/${teamID}/live`);
      if (res.statusCode == 200) {
        const data = res.data;
        setAnalyticsData({
          figmaHistoriesPercentageChange: data.figmaHistoriesPercentageChange || 0,
          githubCommitPercentageChange: data.githubCommitPercentageChange || 0,
          maxActivityCount: data.maxActivityCount || 0,
          minActivityCount: data.minActivityCount || 0,
          teamsLeftInTrack: data.teamsLeftInTrack || 0,
          totalActivityCount: data.totalActivityCount || 0,
          totalFigmaHistories: data.totalFigmaHistories || 0,
          totalGithubCommits: data.totalGithubCommits || 0,
          trackPrize: data.trackPrize || 0,
        });
      } else {
        Toaster.error(res.data.message || SERVER_ERROR);
      }
    };

    const fetchAnnouncements = async () => {
      const res = await getHandler(`/hackathons/${hackathon.id}/participants/announcements/`);
      if (res.statusCode == 200) {
        setAnnouncements(res.data.announcements);
      } else {
        Toaster.error(res.data.message || SERVER_ERROR);
      }
    };

    fetchAnalyticsData();
    fetchAnnouncements();
  }, []);

  const chartConfig = {
    judging: {
      label: 'Judging',
      color: 'hsl(var(--chart-1))',
    },
    round: {
      label: 'Round',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full flex-center max-md:flex-col gap-4 max-md:hidden">
      <div className="w-[28rem] rounded-xl">
        <div className="w-full flex gap-2">
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-bl-none flex items-center justify-between px-4">
            <div className="text-xl font-medium">Track Prize</div>
            <Blueprint size={32} />
          </div>
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-br-none flex items-center justify-between px-4">
            <Users size={32} />
            <div className="text-xl font-medium">Teams Left</div>
          </div>
        </div>
        <Masonry breakpointCols={{ default: 4 }} className="w-[28rem] masonry-grid" columnClassName="masonry-grid_column">
          <div className="w-full h-24 bg-white rounded-b-lg text-3xl font-bold flex-center">₹{formatPrice(analyticsData.trackPrize)}</div>
          <div className="w-[calc(200%-16px)] h-48 bg-white rounded-lg m-2">
            {!currentRound ? (
              nextRound ? (
                <div className="w-full h-full flex-center text-lg">Next round starts {moment(nextRound.startTime).fromNow()}</div>
              ) : (
                <div className="w-full h-full flex-center text-lg">All rounds are over.</div>
              )
            ) : (
              <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[250px] pb-3">
                <RadialBarChart data={roundTimeData.chatData} endAngle={roundTimeData.progressAngle} innerRadius={70} outerRadius={110}>
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[75, 65]}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(val, name) => {
                          return (
                            <>
                              <div
                                className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                                style={
                                  {
                                    '--color-bg': `var(--color-${name})`,
                                  } as React.CSSProperties
                                }
                              />
                              {chartConfig[name as keyof typeof chartConfig]?.label || name}
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                {typeof val === 'number' ? Math.round(val / 60) : val}
                                <span className="font-normal text-muted-foreground">Hrs</span>
                              </div>
                            </>
                          );
                        }}
                      />
                    }
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy || 0} className="fill-foreground text-2xl font-bold">
                                {roundTimeData.timeLeft}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground">
                                until round ends
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
            )}
          </div>
          <div></div>
          <div className="w-full h-24 bg-white rounded-b-lg text-3xl font-bold flex-center">{analyticsData.teamsLeftInTrack}</div>
          <div className="w-full h-[6.5rem] bg-white rounded-t-lg mt-2 text-3xl font-bold flex-center">{analyticsData.totalGithubCommits}</div>
          <div></div>
          <div></div>
          <div className="w-full h-[6.5rem] bg-white rounded-t-lg mt-2 text-3xl font-bold flex-center">{analyticsData.totalFigmaHistories}</div>
        </Masonry>
        <div className="w-full flex gap-2">
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-tl-none px-4 flex flex-col justify-center gap-3">
            <div className="w-full flex items-center justify-between">
              <div className="text-xl font-medium">Github Commits</div>
              <GithubLogo size={32} />
            </div>
            <PercentageChange change={analyticsData.githubCommitPercentageChange} />
          </div>
          <div className="w-1/2 h-24 bg-white rounded-lg rounded-tr-none px-4 flex flex-col justify-center gap-3">
            <div className="w-full flex items-center justify-between">
              <FigmaLogo size={32} />
              <div className="text-xl font-medium text-end">Figma Histories</div>
            </div>
            <PercentageChange change={analyticsData.figmaHistoriesPercentageChange} />
          </div>
        </div>
      </div>
      {announcements && announcements.length > 0 && (
        <div className="w-full h-full max-h-[25rem] bg-white overflow-y-auto thin_scrollbar rounded-lg p-3">
          <div className="text-2xl font-semibold mb-2">Announcements</div>
          {announcements.map(announcement => (
            <div key={announcement.id} className="pb-2">
              <AnnouncementCard announcement={announcement} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const PercentageChange = ({ change }: { change?: number }) =>
  change && change != 0 ? (
    <div className={`${change > 0 ? 'text-green-300' : 'text-priority_high'} text-xs`}>{`${change}% ${
      change > 0 ? 'increase' : 'decrease'
    } from last round`}</div>
  ) : (
    <></>
  );
