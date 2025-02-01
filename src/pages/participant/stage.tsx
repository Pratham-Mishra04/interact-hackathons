import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import TeamView from '@/screens/participants/team_view';
import { HackathonRound, HackathonTeam } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import moment from 'moment';
import BaseWrapper from '@/wrappers/base';
import Loader from '@/components/common/loader';
import socketService from '@/config/ws';
import useTimeEvaluation from '@/hooks/use-time-evaluation';
import useRelativeTime from '@/hooks/use-relative-time';

const Stage = () => {
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [nextRound, setNextRound] = useState<HackathonRound | null>(null);
  const [loading, setLoading] = useState(true);
  const hackathon = useSelector(currentHackathonSelector);
  const nextRoundStartTime = useRelativeTime(nextRound?.startTime);
  const isTeamFormationTime = useTimeEvaluation(
    () => moment().isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime)),
    1000
  );

  const getTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      const team = res.data.team;
      if (!team) Toaster.error('Team Not Found');
      else setTeam(team);
      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  //TODO make a wrapper for this
  useEffect(() => {
    if (!hackathon.id) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      if (hackathon.isEnded) window.location.replace('/participant/ended');
      else if (isTeamFormationTime) window.location.replace('/participant/team');
      else {
        getTeam();
        getCurrentRound();
        socketService.connect(hackathon.id);
      }
    }
  }, [isTeamFormationTime]);

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (res.data.round) {
        window.location.replace('/participant/live');
      }
      setNextRound(res.data.nextRound);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  return (
    <BaseWrapper>
      <div className="w-full min-h-base p-8 md:p-12 flex flex-col md:justify-start gap-8 md:gap-16 font-primary">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="w-full mx-auto flex flex-col items-center md:flex-row gap-4 md:gap-8">
              <div className="w-full md:w-1/2 justify-center items-start flex-col gap-2">
                {team ? (
                  <div className="flex-center flex-col">
                    <h4 className="w-fit gradient-text-3 text-8xl mb-4">{team.title}</h4>
                    {nextRound && <div className="font-semibold text-xl">Team Formation has Ended. Round 1 starts {nextRoundStartTime}</div>}
                  </div>
                ) : (
                  <>
                    <h4 className="w-fit gradient-text-3 text-8xl mb-6">Team Formation has Ended.</h4>
                    <div className="text-4xl font-bold">You cannot proceed as you did not join a team.</div>
                  </>
                )}
              </div>
              <div className="w-full md:w-1/2 flex gap-2 md:gap-4">
                <TeamOverviewAnalytics nextRound={nextRound} />
              </div>
            </div>
            {team && <TeamView team={team} actions={false} />}
          </>
        )}
      </div>
    </BaseWrapper>
  );
};

export default Stage;
