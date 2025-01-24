import BaseWrapper from '@/wrappers/base';
import { Accordion } from '@/components/ui/accordion';
import { AppSidebar } from '@/components/prizes/app-sidebar';
import { TeamAccordianItem } from '@/components/prizes/team-accordian';
import PrizesCarousel from '@/components/prizes/prize-carousel';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORG_URL } from '@/config/routes';
import { useDispatch, useSelector } from 'react-redux';
import { currentHackathonSelector, markHackathonEnded } from '@/slices/hackathonSlice';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { HackathonPrize, HackathonTeam, HackathonTrack } from '@/types';
import { initialHackathonPrize } from '@/types/initials';
import postHandler from '@/handlers/post_handler';
import moment from 'moment';
import { isAccessDeniedError } from '@/utils/funcs/misc';

export default function PrizeDistributionPage() {
  const dispatch = useDispatch();
  const hackathon = useSelector(currentHackathonSelector);

  const [hackathonData, setHackathonData] = useState<{
    name: string;
    tagline: string;
    noTracks: number;
    noParticipants: number;
    remainingParticipants: number;
  }>({
    name: hackathon.title,
    tagline: String(hackathon.tagline),
    noTracks: 0,
    noParticipants: 0,
    remainingParticipants: 0,
  });

  const [prizes, setPrizes] = useState<HackathonPrize[]>([]);
  const [teams, setTeams] = useState<HackathonTeam[]>([]);
  const [displayTeams, setDisplayTeams] = useState<HackathonTeam[]>([]);
  const [currentPrize, setCurrentPrize] = useState<HackathonPrize>(initialHackathonPrize);

  const getHackathonData = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const { tracks, prizes } = res.data.hackathon as { tracks: HackathonTrack[]; prizes: HackathonPrize[] };
      setHackathonData(prev => {
        return {
          ...prev,
          noTracks: tracks.length,
        };
      });
      setPrizes(prizes || []);
    } else {
      const message = res.data?.message;
      Toaster.error(message || SERVER_ERROR);

      if (isAccessDeniedError(message)) window.location.assign('/');
    }
  };

  // no of participants, remaining participants
  const getHackathonAnalytics = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/analytics/live`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const { totalUsers, totalUsersLeft } = res.data;
      setHackathonData(prev => {
        return {
          ...prev,
          noParticipants: totalUsers,
          remainingParticipants: totalUsersLeft,
        };
      });
    } else {
      const message = res.data?.message;
      Toaster.error(message || SERVER_ERROR);

      if (isAccessDeniedError(message)) window.location.assign('/');
    }
  };

  // teams (without round wise scores)
  const getTeamsData = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/teams?populate=scores`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      const { teams } = res.data as { teams: HackathonTeam[] };
      setTeams(teams || []);
      setDisplayTeams(teams || []);
    } else {
      const message = res.data?.message;
      Toaster.error(message || SERVER_ERROR);

      if (isAccessDeniedError(message)) window.location.assign('/');
    }
  };

  const isPrizeDistributionComplete = () => {
    return prizes.every(prize => !!prize.team);
  };

  const handleEndHackathon = async () => {
    if (!isPrizeDistributionComplete()) {
      Toaster.error('Please distribute all prizes before ending the hackathon');
      return;
    }

    const prizeWinners: { prizeID: string; teamID: string }[] = prizes.map(prize => ({
      prizeID: prize.id,
      teamID: prize.team!.id,
    }));

    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/end`;
    const res = await postHandler(URL, { winners: prizeWinners });
    if (res.statusCode == 200) {
      dispatch(markHackathonEnded());
      window.location.assign('/admin/ended');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const filterTeamBasedOnTrack = (trackID: string | undefined) => {
    if ((!trackID && displayTeams.length == teams.length) || !teams.length) return;
    if (!trackID) return setDisplayTeams(teams);
    const filteredTeams = teams.filter(team => team.track?.id === trackID);
    setDisplayTeams(filteredTeams);
  };

  const isTeamSelected = (team: HackathonTeam) => {
    return prizes.some(prize => prize.team?.id === team.id);
  };

  const onTeamSelect = useCallback(
    (team: HackathonTeam) => {
      const updatedprizes = prizes.map(prize => {
        if (prize.team?.id === team.id) {
          return {
            ...prize,
            team: undefined,
          };
        } else if (prize.id === currentPrize?.id) {
          return {
            ...prize,
            team,
          };
        } else return prize;
      });
      setPrizes(updatedprizes);
    },
    [prizes, currentPrize]
  );

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else if (hackathon.isEnded) window.location.replace('/admin/ended');
    else if (moment().isBefore(hackathon.teamFormationEndTime)) window.location.replace('/admin/teams');
    else {
      (async () => {
        await getHackathonAnalytics();
        await getTeamsData();
        await getHackathonData();
      })();
    }
  }, [hackathon]);

  useEffect(() => {
    filterTeamBasedOnTrack(currentPrize?.hackathonTrackID);
  }, [currentPrize]);

  return (
    <BaseWrapper>
      <div className="w-full h-full flex max-md:flex-col-reverse">
        <AppSidebar
          hackathonName={hackathonData.name}
          hackathonTagline={hackathonData.tagline}
          tracks={hackathonData.noTracks}
          participants={hackathonData.noParticipants}
          totalRemaining={hackathonData.remainingParticipants}
          handleEndHackathon={handleEndHackathon}
        />
        <div className={'w-5/6 max-md:w-full h-base max-md:h-fit flex flex-col items-center py-5 overflow-hidden gap-5'}>
          <div className={'text-6xl max-lg:text-5xl max-md:text-4xl gradient-text-3 font-bold'}>Prize distribution</div>
          <PrizesCarousel prizes={prizes} currentPrize={currentPrize} setCurrentPrize={setCurrentPrize} />
          <div
            className={'mt-5 w-4/5 max-lg:w-5/6 max-md:10/12 h-3/4 overflow-y-scroll --scrollbar px-20 max-lg:px-10 max-md:px-2 flex flex-col gap-1'}
          >
            <Accordion type={'single'} collapsible className={'space-y-1'}>
              {displayTeams.map(team => (
                <TeamAccordianItem team={team} key={team.id} selected={isTeamSelected(team)} onSelect={onTeamSelect} />
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </BaseWrapper>
  );
}
