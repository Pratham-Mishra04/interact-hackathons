import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import BaseWrapper from '@/wrappers/base';
import TeamsTable from '@/components/tables/teams';
import getHandler from '@/handlers/get_handler';
import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import { HackathonRound } from '@/types';
import useTimeEvaluation from '@/hooks/use-time-evaluation';
import useRelativeTime from '@/hooks/use-relative-time';

const Stage = () => {
  const [nextRound, setNextRound] = useState<HackathonRound | null>(null);
  const hackathon = useSelector(currentHackathonSelector);
  const nextRoundStartTime = useRelativeTime(nextRound?.startTime);
  const isTeamFormationTime = useTimeEvaluation(
    () => moment().isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime)),
    1000
  );

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (res.data.round) {
        window.location.replace('/admin/live');
      }
      setNextRound(res.data.nextRound);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      const now = moment();
      if (hackathon.isEnded) window.location.replace('/admin/ended');
      else if (isTeamFormationTime) window.location.replace('/admin/teams');
      else getCurrentRound();
    }
  }, [isTeamFormationTime]);

  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base p-12 max-md:p-8 flex flex-col gap-8">
        <div className=" w-full h-fit">
          <div className="w-full mx-auto flex flex-col items-center md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-1/2 flex-center items-start flex-col gap-2">
              <div className="w-fit gradient-text-3 text-9xl">Team</div>
              <div className="w-fit gradient-text-3 text-8xl">Overview</div>
              <div className="font-semibold text-xl">Team Formation has Ended. Round 1 starts {nextRoundStartTime}</div>
            </div>
            <div className="--analytics w-full md:w-1/2 h-full">
              <TeamOverviewAnalytics nextRound={nextRound} />
            </div>
          </div>
        </div>
        <TeamsTable showAllFilters={false} />
      </div>
    </BaseWrapper>
  );
};

export default Stage;
