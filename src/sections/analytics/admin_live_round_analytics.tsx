import React, { useEffect, useState } from 'react';
import { AnalyticBox } from './team_overview';
import { UsersFour, UsersThree } from '@phosphor-icons/react';
import getHandler from '@/handlers/get_handler';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { HackathonRound } from '@/types';
import TimeProgressGraph from '@/components/common/time_graph';
import moment from 'moment';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { isAccessDeniedError } from '@/utils/funcs/misc';

export default function AdminLiveRoundAnalytics({
  currentRound,
  nextRound,
}: {
  currentRound: HackathonRound | null;
  nextRound: HackathonRound | null;
}) {
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTeamsLeft, setTotalTeamsLeft] = useState(0);
  const [totalUsersLeft, setTotalUsersLeft] = useState(0);

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const res = await getHandler(`/org/${hackathon.organizationID}/hackathons/${hackathon.id}/analytics/live`);
      if (res.statusCode == 200) {
        setTotalTeams(res.data.totalTeams);
        setTotalUsers(res.data.totalUsers);
        setTotalTeamsLeft(res.data.totalTeamsLeft);
        setTotalUsersLeft(res.data.totalUsersLeft);
      } else {
        const message = res.data?.message;
        Toaster.error(message || SERVER_ERROR);

        if (isAccessDeniedError(message)) window.location.assign('/');
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      <AnalyticBox className="flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span>
            <h3 className="text-sm font-semibold text-primary_btn">Users Left</h3>
            <h1 className="text-xl font-semibold">{totalUsersLeft}</h1>
          </span>
          <UsersThree size={36} className="bg-primary_text text-white p-2 rounded-md " />
        </div>
        {/* <span className={`${analyticsData.users_left.increase ? 'text-green-600' : 'text-red-600'} font-medium text-xs flex items-center gap-2`}>
          {analyticsData.users_left.increase && <TrendUp size={20} />}
          {!analyticsData.users_left.increase && <TrendDown size={20} />}
          <p>{analyticsData.users_left.trend}</p>
        </span> */}
      </AnalyticBox>
      <AnalyticBox className="flex flex-col gap-5 justify-between">
        <div className="flex items-start justify-between">
          <span>
            <h3 className="text-sm font-semibold text-primary_btn">Total Users</h3>
            <h1 className="text-xl font-semibold">{totalUsers}</h1>
          </span>
          <UsersThree size={36} className="bg-primary_text text-white p-2 rounded-md " />
        </div>
        {/* <span className={`${analyticsData.total_users.increase ? 'text-green-600' : 'text-red-600'} font-medium text-xs flex items-center gap-2`}>
          {analyticsData.total_users.increase && <TrendUp size={20} />}
          {!analyticsData.total_users.increase && <TrendDown size={20} />}
          <p>{analyticsData.total_users.trend}</p>
        </span> */}
      </AnalyticBox>
      <AnalyticBox className="hidden md:block">
        <div className="text-sm font-semibold text-primary_btn">
          {currentRound ? `Round ${(currentRound?.index || 0) + 1} is Live!` : nextRound ? 'Break is going on.' : 'All rounds have ended.'}
        </div>
      </AnalyticBox>
      <AnalyticBox className="flex flex-col gap-5 justify-between">
        <div className="flex items-start justify-between">
          <span>
            <h3 className="text-sm font-semibold text-primary_btn">Teams Left</h3>
            <h1 className="text-xl font-semibold">{totalTeamsLeft}</h1>
          </span>
          <UsersFour size={36} className="bg-primary_text text-white p-2 rounded-md " />
        </div>
        {/* <span className={`${analyticsData.team_left.increase ? 'text-green-600' : 'text-red-600'} font-medium text-xs flex items-center gap-2`}>
          {analyticsData.team_left.increase && <TrendUp size={20} />}
          {!analyticsData.team_left.increase && <TrendDown size={20} />}
          <p>{analyticsData.team_left.trend}</p>
        </span> */}
      </AnalyticBox>
      <AnalyticBox className="flex flex-col gap-5 justify-between">
        <div className="flex items-start justify-between">
          <span>
            <h3 className="text-sm font-semibold text-primary_btn">Total Teams</h3>
            <h1 className="text-xl font-semibold">{totalTeams}</h1>
          </span>
          <UsersFour size={36} className="bg-primary_text text-white p-2 rounded-md " />
        </div>
        {/* <span className={`${analyticsData.total_teams.increase ? 'text-green-600' : 'text-red-600'} font-medium text-xs flex items-center gap-2`}>
          {analyticsData.total_teams.increase && <TrendUp size={20} />}
          {!analyticsData.total_teams.increase && <TrendDown size={20} />}
          <p>{analyticsData.total_teams.trend}</p>
        </span> */}
      </AnalyticBox>
      {currentRound ? (
        <TimeProgressGraph
          time1={moment(currentRound?.startTime)}
          time2={moment(currentRound?.endTime)}
          innerRadius={70}
          outerRadius={100}
          height={140}
          className="max-md:col-span-2"
        />
      ) : (
        nextRound && (
          <TimeProgressGraph
            time1={moment(nextRound?.startTime)}
            time2={moment(nextRound?.endTime)}
            innerRadius={70}
            outerRadius={100}
            height={140}
            className="max-md:col-span-2"
          />
        )
      )}
    </div>
  );
}
