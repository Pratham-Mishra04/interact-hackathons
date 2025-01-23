import React, { useEffect, useState } from 'react';
import Toaster from '@/utils/toaster';
import Loader from '@/components/common/loader';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface Contribution {
  userId: string;
  userName: string;
  contributionScore: number;
  codeContribution: {
    totalCommits: number;
    totalLinesChanged: number;
    totalFilesAffected: number;
    score: number;
  };
  designContribution: {
    totalVersions: number;
    score: number;
  };
  tasksContribution: {
    tasksAssigned: number;
    tasksCompleted: number;
    score: number;
  };
}

interface OverallData {
  user: string;
  codeContribution: number;
  designContribution: number;
  tasksContribution: number;
}

interface CodeData {
  user: string;
  totalCommits: number;
  totalLinesChanged: number;
  totalFilesAffected: number;
  score: number;
}

interface FigmaData {
  user: string;
  totalVersions: number;
  score: number;
}

interface TasksData {
  user: string;
  tasksAssigned: number;
  tasksCompleted: number;
  score: number;
}

const extractContributionData = (contributions: Contribution[]) => {
  const overallData: OverallData[] = [];
  const codeData: CodeData[] = [];
  const figmaData: FigmaData[] = [];
  const tasksData: TasksData[] = [];

  contributions.forEach(contribution => {
    overallData.push({
      user: contribution.userName,
      codeContribution: contribution.codeContribution.score,
      designContribution: contribution.designContribution.score,
      tasksContribution: contribution.tasksContribution.score,
    });

    codeData.push({
      user: contribution.userName,
      totalCommits: contribution.codeContribution.totalCommits,
      totalLinesChanged: contribution.codeContribution.totalLinesChanged,
      totalFilesAffected: contribution.codeContribution.totalFilesAffected,
      score: contribution.codeContribution.score,
    });

    figmaData.push({
      user: contribution.userName,
      totalVersions: contribution.designContribution.totalVersions,
      score: contribution.designContribution.score,
    });

    tasksData.push({
      user: contribution.userName,
      tasksAssigned: contribution.tasksContribution.tasksAssigned,
      tasksCompleted: contribution.tasksContribution.tasksCompleted,
      score: contribution.tasksContribution.score,
    });
  });

  return { overallData, codeData, figmaData, tasksData };
};

const ContributionsGraph = ({
  teamID,
  setScores,
}: {
  teamID: string;
  setScores?: React.Dispatch<
    React.SetStateAction<
      {
        userID: string;
        score: number;
      }[]
    >
  >;
}) => {
  const [overallData, setOverallData] = useState<OverallData[]>([]);
  const [codeData, setCodeData] = useState<CodeData[]>([]);
  const [figmaData, setFigmaData] = useState<FigmaData[]>([]);
  const [tasksData, setTasksData] = useState<TasksData[]>([]);
  const [loading, setLoading] = useState(true);

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchContributions = async () => {
      const res = await getHandler(`/org/${hackathon.organizationID}/hackathons/${hackathon.id}/contributions/${teamID}`, undefined, true);
      if (res.statusCode === 200) {
        const contributions: Contribution[] = res.data.contributions || [];
        const { overallData, codeData, figmaData, tasksData } = extractContributionData(contributions);

        if (setScores)
          contributions.forEach(contribution => {
            setScores(prev => [
              ...prev,
              {
                userID: contribution.userId,
                score: contribution.contributionScore,
              },
            ]);
          });

        setOverallData(overallData);
        setCodeData(codeData);
        setFigmaData(figmaData);
        setTasksData(tasksData);
      } else {
        if (res.data.message) Toaster.error(res.data.message);
        else Toaster.error(SERVER_ERROR);
      }
      setLoading(false);
    };

    fetchContributions();
  }, [teamID]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const overallDataConfig = {
    codeContribution: {
      label: 'Code',
      color: '#2563eb',
    },
    designContribution: {
      label: 'Design',
      color: '#60a5fa',
    },
    tasksContribution: {
      label: 'Tasks',
      color: '#6065fa',
    },
  } satisfies ChartConfig;

  const codeDataConfig = {
    totalCommits: {
      label: 'commits',
      color: '#2563eb',
    },
    totalLinesChanged: {
      label: 'lines changed',
      color: '#60a5fa',
    },
    totalFilesAffected: {
      label: 'files affected',
      color: '#6065fa',
    },
    score: {
      label: 'Overall Score',
      color: '#6065ea',
    },
  } satisfies ChartConfig;

  const figmaDataConfig = {
    totalVersions: {
      label: 'Versions',
      color: '#2563eb',
    },
    score: {
      label: 'Overall Score',
      color: '#6065ea',
    },
  } satisfies ChartConfig;

  const tasksDataConfig = {
    tasksAssigned: {
      label: 'Assigned',
      color: '#2563eb',
    },
    tasksCompleted: {
      label: 'Completed',
      color: '#60a5fa',
    },
    score: {
      label: 'Overall Score',
      color: '#6065ea',
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full h-fit bg-white rounded-xl p-4 pb-0">
      <div className="text-xl font-medium">Team Contributions</div>
      <Carousel
        className="w-full"
        opts={{
          align: 'center',
        }}
      >
        <CarouselContent>
          <CarouselItem key={0}>
            <div className="w-full text-center text-gray-600 font-medium">Overall Contribution Score</div>
            <ChartContainer config={overallDataConfig} className="w-full">
              <BarChart accessibilityLayer data={overallData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="user" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="codeContribution" fill="var(--color-codeContribution)" radius={4} />
                <Bar dataKey="designContribution" fill="var(--color-designContribution)" radius={4} />
                <Bar dataKey="tasksContribution" fill="var(--color-tasksContribution)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CarouselItem>

          <CarouselItem key={1}>
            <div className="w-full text-center text-gray-600 font-medium">Github Contribution Score</div>
            <ChartContainer config={codeDataConfig} className="w-full">
              <BarChart accessibilityLayer data={codeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="user" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalCommits" fill="var(--color-totalCommits)" radius={4} />
                <Bar dataKey="totalLinesChanged" fill="var(--color-totalLinesChanged)" radius={4} />
                <Bar dataKey="totalFilesAffected" fill="var(--color-totalFilesAffected)" radius={4} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CarouselItem>

          <CarouselItem key={2}>
            <div className="w-full text-center text-gray-600 font-medium">Figma Contribution Score</div>
            <ChartContainer config={figmaDataConfig} className="w-full">
              <BarChart accessibilityLayer data={figmaData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="user" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalVersions" fill="var(--color-totalVersions)" radius={4} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CarouselItem>

          <CarouselItem key={3}>
            <div className="w-full text-center text-gray-600 font-medium">Tasks Contribution Score</div>
            <ChartContainer config={tasksDataConfig} className="w-full">
              <BarChart accessibilityLayer data={tasksData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="user" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tasksAssigned" fill="var(--color-tasksAssigned)" radius={4} />
                <Bar dataKey="tasksCompleted" fill="var(--color-tasksCompleted)" radius={4} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default ContributionsGraph;
