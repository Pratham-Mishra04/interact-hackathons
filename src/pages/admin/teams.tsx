import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import React, { useEffect } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import BaseWrapper from '@/wrappers/base';
import TeamsTable from '@/components/tables/teams';

const Teams = () => {
  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else if (hackathon.isEnded) window.location.replace('/admin/ended');
    else if (moment().isAfter(hackathon.teamFormationEndTime)) window.location.replace('/admin/live');
  }, []);

  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base p-12 max-md:p-8 flex flex-col gap-8">
        <div className=" w-full h-fit">
          <div className="w-full mx-auto flex flex-col items-center md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-1/2 justify-center items-start flex-col gap-2">
              <h4 className="w-fit gradient-text-3 text-8xl">Team Overview</h4>
              <div className="text-3xl font-bold">Manage, Monitor, and Analyze Participation.</div>
            </div>
            <aside className="--analytics w-full md:w-1/2 h-full">
              <TeamOverviewAnalytics />
            </aside>
          </div>
        </div>
        <TeamsTable showAllFilters={false} />
      </div>
    </BaseWrapper>
  );
};

export default Teams;
