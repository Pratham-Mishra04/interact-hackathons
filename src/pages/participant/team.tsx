import { SERVER_ERROR } from '@/config/errors';
import deleteHandler from '@/handlers/delete_handler';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import CreateTeam from '@/sections/teams/create_team';
import JoinTeam from '@/sections/teams/join_team';
import TeamView from '@/screens/participants/team_view';
import { userSelector } from '@/slices/userSlice';
import { HackathonTeam, HackathonTrack } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import moment from 'moment';
import patchHandler from '@/handlers/patch_handler';
import BaseWrapper from '@/wrappers/base';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import socketService from '@/config/ws';
import Image from 'next/image';
import useTimeEvaluation from "@/hooks/use-time-evaluation";

const Team = () => {
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [tracks, setTracks] = useState<HackathonTrack[] | null>(null);
  const [clickedOnCreateTeam, setClickedOnCreateTeam] = useState(false);
  const [clickedOnJoinTeam, setClickedOnJoinTeam] = useState(false);
  const user = useSelector(userSelector);
  const hackathon = useSelector(currentHackathonSelector);
  const isTeamFormationTime = useTimeEvaluation(
      ()=>moment().isBetween(
          moment(hackathon.teamFormationStartTime),
          moment(hackathon.teamFormationEndTime)
      ),
      1000,
  )

  //TODO get hackathon details as well to update the state in case of any updations. (rn we need to go to index and click again to reflect hackathon changes)
  const getTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setTeam(res.data.team);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const getTracks = async () => {
    const URL = `/hackathons/tracks/${hackathon.id}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setTracks(res.data.tracks);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  //TODO make a wrapper for this
  useEffect(() => {
    if (!hackathon.id) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      const now = moment();
      if (hackathon.isEnded) window.location.replace('/participant/ended');
      else if (!isTeamFormationTime) {
        if (now.isAfter(hackathon.startTime)) window.location.replace('/participant/live');
        else window.location.replace('/');
      } else {
        getTeam();
        getTracks();
        socketService.connect(hackathon.id);
      }
    }
  }, [isTeamFormationTime]);

  const handleCreateTeam = async (formData: any) => {
    const toaster = Toaster.startLoad('Creating Team');

    const URL = `/hackathons/${hackathon.id}/participants/teams`;
    const res = await postHandler(URL, formData);
    if (res.statusCode == 201) {
      setTeam(res.data.team);
      Toaster.stopLoad(toaster, 'Team Created Successfully', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleJoinTeam = async (formData: any) => {
    const toaster = Toaster.startLoad('Joining Team');

    const URL = `/hackathons/${hackathon.id}/participants/teams/join`;
    const res = await postHandler(URL, formData);
    if (res.statusCode == 200) {
      setTeam(res.data.team);
      Toaster.stopLoad(toaster, 'Team Joined Successfully', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const handleDeleteTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams/${team?.id}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 204) {
      setTeam(null);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const handleLeaveTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams/${team?.id}/leave`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 200) {
      setTeam(prev => {
        if (prev)
          return {
            ...prev,
            membership: prev?.memberships.filter(m => m.userID != user.id),
          };
        return null;
      });
      setTeam(null);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const handleUpdateTeam = async (formData: any) => {
    const URL = `/hackathons/${hackathon.id}/participants/teams/${team?.id}`;
    const res = await patchHandler(URL, formData);
    if (res.statusCode == 200) {
      Toaster.success('Team Data Updated Successfully');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const handleKickMember = async (userID: string) => {
    const URL = `/hackathons/${hackathon.id}/participants/teams/${team?.id}/member/${userID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 200) {
      setTeam(prev => {
        if (prev)
          return {
            ...prev,
            memberships: prev?.memberships.filter(m => m.userID != userID),
          };
        return null;
      });
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  return (
    <BaseWrapper>
      <div className="w-full min-h-base p-8 md:p-12 flex flex-col md:justify-start gap-8 md:gap-16 font-primary">
        <div className="w-full mx-auto flex flex-col items-center md:flex-row gap-4 md:gap-8">
          <div className="w-full md:w-1/2 justify-center items-start flex-col gap-2">
            {team ? (
              <div className="flex-center flex-col">
                <h4 className="w-fit gradient-text-3 text-8xl max-md:text-5xl mb-4">{team.title}</h4>
                <div className="font-semibold text-xl">
                  The Team Code is{' '}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span
                          onClick={() => {
                            navigator.clipboard.writeText(team.token);
                            Toaster.success('Copied to Clipboard!');
                          }}
                          className="underline underline-offset-2 cursor-pointer"
                        >
                          {team.token}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Copy to Clipboard</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ) : (
              <>
                <h4 className="w-fit gradient-text-3 text-8xl mb-6">Team Formation</h4>
                <div className="text-4xl font-bold">Create, and Join Teams Effortlessly.</div>
              </>
            )}
          </div>
          <div className="w-full md:w-1/2 flex gap-2 md:gap-4">
            <TeamOverviewAnalytics />
          </div>
        </div>
        {team ? (
          <TeamView
            team={team}
            onDeleteTeam={handleDeleteTeam}
            onUpdateTeam={handleUpdateTeam}
            onLeaveTeam={handleLeaveTeam}
            onKickMember={handleKickMember}
            tracks={tracks}
          />
        ) : (
          <div className="w-full flex flex-col md:flex-row gap-4 md:gap-12">
            <CreateTeam
              show={clickedOnCreateTeam}
              setShow={setClickedOnCreateTeam}
              submitHandler={handleCreateTeam}
              hackathonID={hackathon.id}
              tracks={tracks}
            />
            <JoinTeam show={clickedOnJoinTeam} setShow={setClickedOnJoinTeam} submitHandler={handleJoinTeam} />
            <HoverEffect
              className="w-full"
              items={[
                {
                  title: 'Create Team',
                  description: 'Initiate brilliance! Create a team to transform your visionary ideas into actionable innovation',
                  onClick: () => setClickedOnCreateTeam(true),
                },
                {
                  title: 'Join Team',
                  description: 'Contribute to success! Join a team to merge your skills with theirs and drive innovative solutions.',
                  onClick: () => setClickedOnJoinTeam(true),
                },
              ]}
            />
          </div>
        )}
      </div>
    </BaseWrapper>
  );
};

export default Team;
