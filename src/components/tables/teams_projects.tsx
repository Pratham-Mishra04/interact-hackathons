import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '../common/loader';
import Image from 'next/image';
import TeamSearchFilters from '../team_search_filters';
import TeamMemberHoverCard from '@/components/team_member_hover_card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HackathonRound, HackathonTeam, HackathonTrack } from '@/types';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { ORG_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { UserPlus } from '@phosphor-icons/react';
import { initialHackathonTeam } from '@/types/initials';
import AddTeamMember from '@/sections/admin/add_team_member';
import NewTeam from '@/sections/admin/new_team';
import Status from '../common/status';
import { isAccessDeniedError } from '@/utils/funcs/misc';
import { userSelector } from '@/slices/userSlice';
import { getHackathonRole } from '@/utils/funcs/hackathons';

const TeamProjectsTable = () => {
  const [teams, setTeams] = useState<HackathonTeam[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('');
  const [eliminated, setEliminated] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [order, setOrder] = useState('latest');
  const [tracks, setTracks] = useState<HackathonTrack[]>([]);
  const [clickedOnAddMember, setClickedOnAddMember] = useState<boolean>(false);
  const [clickedTeam, setClickedTeam] = useState(initialHackathonTeam);
  const [round, setRound] = useState<HackathonRound | undefined>();

  const hackathon = useSelector(currentHackathonSelector);
  const user = useSelector(userSelector);
  const role = getHackathonRole();

  const fetchTeams = async (abortController?: AbortController, initialPage?: number) => {
    setLoading(true);
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/teams?page=${
      initialPage ? initialPage : page
    }&limit=${20}&search=${search}${track != '' && track != 'none' ? `&track_id=${track}` : ''}${
      overallScore != 0 ? `&overall_score=${overallScore}` : ''
    }${
      eliminated != '' && eliminated != 'none' ? `&is_eliminated=${eliminated == 'eliminated' ? 'true' : 'false'}` : ''
    }&order=${order}&include=round_score`;

    const res = await getHandler(URL, abortController?.signal, true);
    if (res.statusCode == 200) {
      if (initialPage == 1) {
        setTeams(res.data.teams || []);
        setRound(res.data.round);
      } else {
        const addedTeams = [...teams, ...(res.data.teams || [])];
        if (addedTeams.length === teams.length) setHasMore(false);
        setTeams(addedTeams);
      }
      setPage(prev => prev + 1);
      setLoading(false);
    } else if (res.status != -1) {
      const message = res.data?.message;
      Toaster.error(message || SERVER_ERROR);

      if (isAccessDeniedError(message)) window.location.assign('/');
    }
  };

  let oldAbortController: AbortController | null = null;

  useEffect(() => {
    const abortController = new AbortController();
    if (oldAbortController) oldAbortController.abort();
    oldAbortController = abortController;

    if (!hackathon.id) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      setPage(1);
      setTeams([]);
      setHasMore(true);
      setLoading(true);
      fetchTeams(abortController, 1);
    }

    return () => {
      abortController.abort();
    };
  }, [search, track, eliminated, overallScore, order]);

  const getTracks = async () => {
    const URL = `/hackathons/tracks/${hackathon.id}`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setTracks(res.data.tracks);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    getTracks();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {hackathon.coordinators?.includes(user.id) && (
        <>
          <div className="w-full flex justify-end">
            <NewTeam tracks={tracks} />
          </div>
          <AddTeamMember show={clickedOnAddMember} setShow={setClickedOnAddMember} team={clickedTeam} />
        </>
      )}
      <TeamSearchFilters
        search={search}
        setSearch={setSearch}
        track={track}
        setTrack={setTrack}
        eliminated={eliminated}
        setEliminated={setEliminated}
        overallScore={overallScore}
        setOverallScore={setOverallScore}
        order={order}
        setOrder={setOrder}
        tracks={tracks}
      />
      <InfiniteScroll className="w-full" dataLength={teams.length} next={fetchTeams} hasMore={hasMore} loader={<></>}>
        <Table className="bg-white rounded-md">
          <TableHeader className="uppercase text-xs md:text-sm">
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Track</TableHead>
              <TableHead className="max-md:hidden">Members</TableHead>
              <TableHead>Elimination Status</TableHead>
              {role === 'admin' && <TableHead>{hackathon.isEnded ? 'Overall Score' : `Round ${round ? round.index + 1 : ''} Score`}</TableHead>}
              {!hackathon.isEnded && hackathon.coordinators?.includes(user.id) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="w-full">
            {teams.map((team, index) => (
              <TableRow
                onClick={() => window.location.assign('/admin/' + (hackathon.isEnded ? 'ended/' : 'live/') + team.id)}
                key={index}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">{team.title}</TableCell>
                <TableCell>{team.project?.title || '-'}</TableCell>
                <TableCell>{team.track?.title}</TableCell>
                <TableCell className="min-w-[150px] max-w-[300px] flex items-center gap-2 flex-wrap max-md:hidden">
                  {team.memberships &&
                    team.memberships?.map((m, index) => {
                      return (
                        <TeamMemberHoverCard
                          key={index}
                          membership={m}
                          trigger={
                            <Image
                              key={index}
                              crossOrigin="anonymous"
                              width={50}
                              height={50}
                              alt={'User Pic'}
                              src={`${USER_PROFILE_PIC_URL}/${m.user.profilePic}`}
                              placeholder="blur"
                              blurDataURL={m.user.profilePicBlurHash || 'no-hash'}
                              className="w-6 h-6 rounded-full shadow-md cursor-pointer"
                            />
                          }
                        />
                      );
                    })}
                </TableCell>
                <TableCell>
                  <Status className="text-xs w-fit px-3 py-1 rounded-full" status={team.isEliminated ? 'eliminated' : 'not eliminated'} />
                </TableCell>
                {role === 'admin' && <TableCell>{hackathon.isEnded ? team.overallScore : team.roundScore}</TableCell>}
                {!hackathon.isEnded && hackathon.coordinators?.includes(user.id) && (
                  <TableCell
                    onClick={el => {
                      el.stopPropagation();
                      setClickedTeam(team);
                      setClickedOnAddMember(true);
                    }}
                  >
                    <UserPlus />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {loading && (
          <div className="w-full flex-center">
            <Loader />
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default TeamProjectsTable;
