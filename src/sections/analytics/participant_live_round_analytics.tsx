import React, { useEffect, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { Announcement, HackathonRound } from '@/types';
import TimeProgressGraph from '@/components/common/time_graph';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import ComparisonScoreBar from './comparison_score_bar';
import AnnouncementCard from '@/components/announcement_card';

export default function ParticipantLiveRoundAnalytics({ teamID, currentRound }: { teamID: string; currentRound: HackathonRound | null }) {
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
        console.log(res);
        Toaster.error(res.data.message || SERVER_ERROR);
      }
    };

    const fetchAnnouncements = async () => {
      const res = await getHandler(`/hackathons/${hackathon.id}/participants/announcements/`);
      if (res.statusCode == 200) {
        setAnnouncements(res.data.announcements);
      } else {
        if (res.data.message) Toaster.error(res.data.message);
        else Toaster.error(SERVER_ERROR);
      }
    };

    fetchAnalyticsData();
    fetchAnnouncements();
  }, []);

  const settings = {
    dots: announcements && announcements.length > 0 && true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: announcements && announcements.length > 0 && true,
    autoplaySpeed: 5000,
    vertical: true,
  };

  const showTimeTillJudging = moment(currentRound?.judgingStartTime).isAfter(moment());

  return (
    <div {...settings} className="relative">
      {!hackathon.isEnded && (
        <div className="w-full">
          <div className="w-full flex gap-6 mb-6">
            <AnalyticsCard
              title="Github Commits"
              value={analyticsData.totalGithubCommits}
              change={analyticsData.githubCommitPercentageChange == 0 ? undefined : analyticsData.githubCommitPercentageChange}
            />
            <AnalyticsCard
              title="Figma Activity"
              value={analyticsData.totalFigmaHistories}
              change={analyticsData.figmaHistoriesPercentageChange == 0 ? undefined : analyticsData.figmaHistoriesPercentageChange}
            />
            <div className="w-1/3 max-md:hidden h-36 bg-white rounded-xl p-4">
              <ComparisonScoreBar
                max={analyticsData.maxActivityCount}
                min={analyticsData.minActivityCount}
                score={analyticsData.totalActivityCount}
              />
            </div>
          </div>
          <div className="w-full md:hidden h-36 bg-white rounded-xl p-4 mb-6">
            <ComparisonScoreBar max={analyticsData.maxActivityCount} min={analyticsData.minActivityCount} score={analyticsData.totalActivityCount} />
          </div>
          <div className="w-full flex gap-6 mb-2">
            <div className="w-2/3 max-md:hidden bg-white rounded-xl gap-3 md:gap-4 pb-4">
              {showTimeTillJudging ? (
                <TimeGraphWrapper
                  title={'Time Till Judging'}
                  time1={moment(currentRound?.startTime)}
                  time2={moment(currentRound?.judgingStartTime)}
                />
              ) : (
                <TimeGraphWrapper title={'Time Till Round Ends'} time1={moment(currentRound?.startTime)} time2={moment(currentRound?.endTime)} />
              )}
            </div>
            <div className="w-1/3 max-md:w-full flex md:flex-col gap-6">
              <div className="w-full h-1/2 max-md:h-fit bg-white rounded-xl p-3">
                <div className="text font-medium">Track Prize</div>
                <div className="text-3xl font-semibold">{analyticsData.trackPrize}</div>
              </div>
              <div className="w-full h-1/2 max-md:h-fit bg-white rounded-xl p-3">
                <div className="text font-medium">Teams Left</div>
                <div className="text-3xl font-semibold">{analyticsData.teamsLeftInTrack}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {announcements && announcements.length > 0 && (
        <div className="w-full h-full max-h-96 overflow-y-auto thin_scrollbar">
          <div className="text-3xl font-semibold mb-2">Announcements</div>
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

const TimeGraphWrapper = ({ title, time1, time2 }: { title?: String; time1: moment.Moment; time2: moment.Moment }) => {
  return (
    <div className="w-full h-fit">
      {title && <div className="py-4 text-center font-medium text-gray-500">{title}</div>}
      <TimeProgressGraph time1={time1} time2={time2} height={130} innerRadius={100} outerRadius={150} />
    </div>
  );
};

export const AnalyticsCard = ({ title, value, change }: { title: string; value: number; change?: number }) => (
  <div className="w-1/3 max-md:w-1/2 h-36 flex flex-col justify-between bg-white rounded-xl p-4">
    <div className="w-full flex flex-col gap-1">
      <div className="text font-medium">{title}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
    {change && change != 0 && (
      <div className={`${change > 0 ? 'text-priority_low' : 'text-priority_high'} text-xs`}>{`${change}% ${
        change > 0 ? 'increase' : 'decrease'
      } from last round`}</div>
    )}
  </div>
);
