import React, { useEffect, useState } from 'react';
import { UsersThree } from '@phosphor-icons/react';
import { PencilRuler } from 'lucide-react';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { HackathonTeam, HackathonTeamMembership, User } from '@/types';
import Image from 'next/image';
import CodeQualityGraph from '../analytics/code_quality_graph';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import ContributionsGraph from '../analytics/contribution_graph';
import ComparisonScoreBar from '../analytics/comparison_score_bar';
import Status from '@/components/common/status';

const TeamDetails = ({ team }: { team: HackathonTeam }) => {
  const [scores, setScores] = useState<{ userID: string; score: number }[]>([]);
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

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const res = await getHandler(`/org/${hackathon.organizationID}/hackathons/${hackathon.id}/analytics/live/${team.id}`, undefined, true);
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
        if (res.data.message) Toaster.error(res.data.message);
        else Toaster.error(SERVER_ERROR);
      }
    };

    if (team.id != '' && !hackathon.isEnded) fetchAnalyticsData();
  }, [team]);

  return (
    <div className="w-full p-4">
      <section className="--team-details md:hidden flex flex-col gap-2 pb-4 border-b-[2px] mb-4 border-primary_text">
        <h1 className="text-2xl font-semibold">{team.title}</h1>
        <div className="flex flex-wrap gap-2 items-center justify-between">
          {team.track?.title && (
            <h2 className="text-base font-semibold text-primary_text flex items-center w-full gap-1">
              <PencilRuler size={24} /> <p className="text-primary_black truncate w-full ">{team.track?.title}</p>
            </h2>
          )}
          <h2 className="text-base font-semibold text-primary_text flex items-center gap-1">
            <UsersThree size={24} />
            <span className="text-primary_black">{team.memberships?.length}</span>
          </h2>
        </div>
        <Status className="text-xs w-fit px-4 rounded-full" status={team.isEliminated ? 'eliminated' : 'not eliminated'} />
      </section>

      {team.id && (
        <div className="w-full flex max-md:flex-col gap-4">
          <div className="w-2/3 max-md:w-full flex flex-col gap-4">
            {!hackathon.isEnded && (
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex gap-4">
                  {hackathon.enableGithubIntegration && (
                    <AnalyticsCard
                      title="Github Commits"
                      value={analyticsData.totalGithubCommits}
                      change={analyticsData.githubCommitPercentageChange == 0 ? undefined : analyticsData.githubCommitPercentageChange}
                    />
                  )}
                  {hackathon.enableFigmaIntegration && (
                    <AnalyticsCard
                      title="Figma Activity"
                      value={analyticsData.totalFigmaHistories}
                      change={analyticsData.figmaHistoriesPercentageChange == 0 ? undefined : analyticsData.figmaHistoriesPercentageChange}
                    />
                  )}
                  <div className="w-full h-36 bg-white rounded-xl p-4 max-md:hidden">
                    <ComparisonScoreBar
                      max={analyticsData.maxActivityCount}
                      min={analyticsData.minActivityCount}
                      score={analyticsData.totalActivityCount}
                    />
                  </div>
                </div>
              </div>
            )}
            {!hackathon.isEnded && (
              <div className="w-full h-36 bg-white rounded-xl p-4 md:hidden">
                <ComparisonScoreBar
                  max={analyticsData.maxActivityCount}
                  min={analyticsData.minActivityCount}
                  score={analyticsData.totalActivityCount}
                />
              </div>
            )}
            <div className="w-full flex flex-col gap-4 pb-3 max-md:hidden">
              <ContributionsGraph teamID={team.id} setScores={setScores} />
            </div>
            {hackathon.enableAutoCodeReviews ? (
              <CodeQualityGraph teamID={team.id} />
            ) : (
              <div className="bg-white">Automated COde reviews not enabled for this hackathon.</div>
            )}
          </div>
          <div className="w-1/3 max-md:w-full flex flex-col gap-4">
            {team.memberships?.map(membership => {
              const scoreObj = scores.filter(s => s.userID == membership.userID)[0];
              let score = undefined;
              if (scoreObj) score = scoreObj.score;
              return <MemberCard key={membership.id} membership={membership} score={score} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;

function MemberCard({ membership, score }: { membership: HackathonTeamMembership; score?: number }) {
  const user = membership.user;
  return (
    <div className="w-full bg-white rounded-lg flex items-center p-4 gap-4">
      <Image
        crossOrigin="anonymous"
        width={50}
        height={50}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
        placeholder="blur"
        blurDataURL={user.profilePicBlurHash || 'no-hash'}
        className="w-20 h-20 rounded-full cursor-default shadow-md"
      />
      <div className="">
        <div className="flex-center flex-wrap gap-1">
          <h1 className="text-lg md:text-xl font-semibold">{user.name}</h1>
          <h1 className="text-xs">@{user.username}</h1>
        </div>
        <p className="text-xs md:text-sm lg:text-base">{membership.role}</p>
        {score != undefined && <p className="text-xs mt-2">Team Contribution Score: {score.toFixed(2)}</p>}
      </div>
    </div>
  );
}

export const AnalyticsCard = ({ title, value, change }: { title: string; value: number; change?: number }) => (
  <div className="w-1/3 max-md:w-1/2 h-36 flex flex-col justify-between bg-white rounded-xl p-4">
    <div className="w-full flex flex-col gap-1">
      <div className="font-medium">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
    {change && change != 0 && (
      <div className={`${change > 0 ? 'text-priority_low' : 'text-priority_high'} text-xs`}>{`${change}% ${
        change > 0 ? 'increase' : 'decrease'
      } from last round`}</div>
    )}
  </div>
);
