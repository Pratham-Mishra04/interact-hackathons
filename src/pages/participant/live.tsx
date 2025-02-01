import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import NewProject from '@/sections/projects/new_project';
import TeamView from '@/screens/participants/team_view';
import { HackathonRound, HackathonTeam } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useMemo, useState } from 'react';
import Tasks from '@/screens/participants/tasks';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import BaseWrapper from '@/wrappers/base';
import moment from 'moment';
import ParticipantLiveRoundAnalytics from '@/sections/analytics/participant_live_round_analytics';
import TeamEliminated from '@/screens/participants/team_eliminated';
import ProjectView from '@/screens/participants/view_project';
import Loader from '@/components/common/loader';
import socketService from '@/config/ws';
import TeamNotRegistered from '@/screens/participants/not_registered';
import Image from 'next/image';
import useRelativeTime from "@/hooks/use-relative-time";
import useTimeEvaluation from "@/hooks/use-time-evaluation";

const Live = () => {
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [currentRound, setCurrentRound] = useState<HackathonRound | null>(null);
  const [nextRound, setNextRound] = useState<HackathonRound | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const judgingStartTime = useRelativeTime(currentRound?.judgingStartTime);
  const nextRoundStartTime = useRelativeTime(nextRound?.startTime);
  const hackathon = useSelector(currentHackathonSelector);
  const isTeamFormationTime = useTimeEvaluation(
      ()=>moment().isBetween(
          moment(hackathon.teamFormationStartTime),
          moment(hackathon.teamFormationEndTime)
      ),
      1000,
  )


  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      if (!res.data.round && res.data.nextRound && res.data.nextRound.index == 0) {
        window.location.replace('/participant/stage');
      }
      setCurrentRound(res.data.round);
      setNextRound(res.data.nextRound);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

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

  const project = useMemo(() => team?.project, [team]);

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

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && (tab == 'repositories' || tab == 'figma')) setIndex(1);
  }, []);

  return (
    <BaseWrapper>
      {team ? (
        team.isEliminated && currentRound && !moment().isBetween(currentRound?.judgingStartTime, currentRound?.endTime) ? (
          <TeamEliminated team={team} />
        ) : (
          <div className="w-full min-h-base p-12 flex flex-col gap-10">
            <div className="w-full flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/5 flex flex-col items-center justify-between gap-8">
                <div
                  style={{
                    background: '-webkit-linear-gradient(0deg, #607ee7,#478EE1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  className="w-fit text-3xl lg:text-5xl font-semibold"
                >
                  {team.title}
                </div>
                <div className="w-fit text-4xl md:text-6xl lg:text-10xl flex flex-col font-bold">
                  <div className="w-full h-full max-md:text-center">
                    <div className="text-xl">Now Ongoing</div>
                    <div
                      style={{
                        background: '-webkit-linear-gradient(0deg, #607ee7,#478EE1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                      className="text-7xl lg:text-9xl font-bold"
                    >
                      {currentRound ? `Round ${currentRound.index + 1}` : 'Break'}
                    </div>
                    <div className="mx-auto text-3xl w-fit font-medium">
                      {currentRound
                        ? moment().isBetween(moment(currentRound.judgingStartTime), moment(currentRound.endTime))
                          ? 'Judging is Live!'
                          : moment(currentRound.judgingStartTime).isAfter(moment()) &&
                            `Judging Starts ${judgingStartTime}.`
                        : nextRound
                        ? ` Round ${nextRound.index + 1} Starts ${nextRoundStartTime}.`
                        : 'All rounds are over.'}
                    </div>
                  </div>
                </div>

                <div className="w-fit flex flex-row items-start justify-start md:gap-4 rounded-lg overflow-hidden md:rounded-none md:overflow-auto">
                  {(team.projectID ? ['Team', 'Project', 'Tasks'] : ['Team', 'Project']).map((tab, i) => (
                    <div
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`${
                        index == i ? 'bg-[#4B9EFF] text-white ' : 'bg-white text-primary_black'
                      } text-sm md:text-lg md:rounded-3xl py-2 px-10 font-medium cursor-pointer transition-ease-300`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
              {team.id && (
                <div className="w-full md:w-3/5 max-md:hidden">
                  <ParticipantLiveRoundAnalytics teamID={team.id} currentRound={currentRound} nextRound={nextRound} />
                </div>
              )}
            </div>
            <div className="w-full">
              {index == 0 && <TeamView team={team} actions={false} />}
              {index == 1 && (
                <>
                  {team?.projectID && project ? (
                    <ProjectView project={project} team={team} setTeam={setTeam} />
                  ) : (
                    <NewProject setTeam={setTeam} team={team} />
                  )}
                </>
              )}
              {index == 2 && team.projectID && <Tasks slug={project?.slug || ''} />}
            </div>
          </div>
        )
      ) : loading ? (
        <div className="w-full h-base flex-center">
          <Loader />
        </div>
      ) : (
        <TeamNotRegistered />
      )}
    </BaseWrapper>
  );
};

export default Live;
