import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, XAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { GithubRepo } from '@/types';
import moment from 'moment';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import Loader from '@/components/common/loader';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';

export const description = 'An interactive bar chart';

type MetricScore = {
  metric: string;
  score: number;
};

const convertRepoMetricsToArray = (repo: GithubRepo): MetricScore[] => {
  return Object.entries(repo).reduce<MetricScore[]>((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc.push({ metric: key, score: value });
    }

    return acc;
  }, []);
};

const getColorByIndex = (index: number): string => {
  const colors = [
    '#FF5733', // Red-Orange
    '#33FF57', // Green
    '#3357FF', // Blue
    '#FF33A1', // Pink
    '#FFBD33', // Yellow-Orange
    '#33FFF5', // Cyan
    '#A133FF', // Purple
    '#FF6F33', // Light Red-Orange
    '#33FFBD', // Light Green
    '#3338FF', // Deep Blue
  ];

  return colors[index % colors.length];
};

const CodeQualityGraph = ({ teamID }: { teamID: string }) => {
  const [graphIndex, setGraphIndex] = useState(-1);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  const reposData = useMemo(() => githubRepos.map(repo => convertRepoMetricsToArray(repo as GithubRepo)), [githubRepos]);
  const chartData = useMemo(() => reposData[graphIndex], [graphIndex, reposData]);

  const hackathon = useSelector(currentHackathonSelector);

  const chartConfig = useMemo(
    () => ({
      repo: {
        label: githubRepos[graphIndex]?.repoName || 'Github Repo',
        color: getColorByIndex(graphIndex),
      },
    }),
    [githubRepos, graphIndex]
  ) satisfies ChartConfig;

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/connections/${teamID}`;
        const res = await getHandler(URL, undefined, true);
        if (res.statusCode == 200) {
          setGithubRepos(res.data.githubRepos || []);
        } else {
          if (res.data.message) Toaster.error(res.data.message);
          else Toaster.error(SERVER_ERROR);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [teamID]);

  return loading ? (
    <Loader />
  ) : (
    <AnalyticBox className="hidden md:block">
      <div className="mb-4">
        <h1 className="text-lg font-semibold uppercase">Connected Repositories</h1>
        <span className="text-xs text-muted-foreground">*Scores are calculated 15-30 minutes before each judging round starts.</span>
      </div>
      {githubRepos && githubRepos.length > 0 ? (
        <div className="flex">
          {githubRepos.map((repo, index) => {
            const isActive = graphIndex === index;
            return (
              <button
                key={index}
                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left 
          sm:border-l sm:border-t-0 sm:px-8 sm:py-6 
          ${isActive ? 'bg-blue-100 border-blue-500 shadow-lg' : 'hover:bg-gray-100 hover:shadow-md'}
          transition-all duration-300 ease-in-out transform`}
                onClick={() => setGraphIndex(index)}
              >
                <div className="w-full h-full flex items-start justify-between">
                  <span className="text-lg font-semibold leading-none sm:text-3xl">{repo.repoName}</span>
                  <Link target="_blank" href={repo.repoLink}>
                    <ArrowUpRight />
                  </Link>
                </div>
                <span className="text-xs text-muted-foreground">Last Synced {moment(repo.updatedAt).fromNow()}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>No Github Repositories are connected for analytics.</div>
      )}

      {graphIndex != -1 && chartData.map(c => c.score).reduce((a, b) => a + b, 0) != 0 && (
        <ChartContainer config={chartConfig} className="h-fit w-full">
          <BarChart data={chartData}>
            <XAxis dataKey="metric" tickLine={false} tickMargin={10} axisLine={false} angle={-75} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="score" fill="var(--color-repo)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </AnalyticBox>
  );
};

type BoxProps = {
  children: React.ReactNode;
  className?: string;
};
export function AnalyticBox({ children, className }: BoxProps) {
  return <div className={`p-4 bg-white rounded-lg w-full ${className}`}>{children}</div>;
}

export default CodeQualityGraph;
