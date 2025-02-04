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
import {PencilSimple, UserPlus} from '@phosphor-icons/react';
import { initialHackathonTeam } from '@/types/initials';
import AddTeamMember from '@/sections/admin/add_team_member';
import NewTeam from '@/sections/admin/new_team';
import Status from '../common/status';
import { isAccessDeniedError } from '@/utils/funcs/misc';
import { userSelector } from '@/slices/userSlice';
import {getHackathonRole} from "@/utils/funcs/hackathons";
import {TrashIcon} from "@radix-ui/react-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import deleteHandler from "@/handlers/delete_handler";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import patchHandler from "@/handlers/patch_handler";


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
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
  const [showEditTeamDialog, setShowEditTeamDialog] = useState(false);

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

  const handleDeleteTeam = (team: HackathonTeam)=>{
    setClickedTeam(()=>{
      setShowDeleteTeamDialog(true);
      return team;
    });
  }

  const handleEditTeam = (team: HackathonTeam)=>{
    setClickedTeam(()=>{
      setShowEditTeamDialog(true);
      return team;
    });
  }

  useEffect(() => {
    getTracks();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {hackathon.coordinators?.includes(user.id) && !hackathon.isEnded && (
        <>
          <div className="w-full flex justify-end">
            <NewTeam tracks={tracks} />
          </div>
          <AddTeamMember show={clickedOnAddMember} setShow={setClickedOnAddMember} team={clickedTeam} />
          <DeleteTeam show={showDeleteTeamDialog} setShow={setShowDeleteTeamDialog} team={clickedTeam} setTeams={setTeams} />
          <EditTeam show={showEditTeamDialog} setShow={setShowEditTeamDialog} team={clickedTeam} setTeams={setTeams} />
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
                {role === "admin" && <TableCell>{hackathon.isEnded ? team.overallScore : team.roundScore}</TableCell>}
                {!hackathon.isEnded && hackathon.coordinators?.includes(user.id) && (
                  <TableCell className={"flex gap-2 items-center max-md:gap-1"}>
                    <div
                        className={"hover:bg-gray-300/40 p-1 rounded"}
                      onClick={el => {
                        el.stopPropagation();
                        setClickedTeam(team);
                        setClickedOnAddMember(true);
                      }}
                    >
                      <UserPlus className={"size-[1.15rem]"} />
                    </div>
                    {role === 'admin' && <div
                        className={"hover:bg-gray-300/40 p-1 rounded"}
                        onClick={e=>{
                          e.stopPropagation();
                          handleEditTeam(team);
                        }}
                    >
                      <PencilSimple className={'size-[1.15rem]'} />
                    </div>}
                    <div
                        className={"hover:bg-gray-300/40 p-1 rounded"}
                        onClick={e=>{
                          e.stopPropagation();
                          handleDeleteTeam(team)
                        }}
                    >
                      <TrashIcon className={"size-[1.15rem]"} />
                    </div>
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

interface TeamActionProps {
  team: HackathonTeam,
  show: boolean,
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
  setTeams: React.Dispatch<React.SetStateAction<HackathonTeam[]>>
}

export const EditTeam = ({
    team,
    show,
    setShow,
    setTeams
}: TeamActionProps)=> {
  const hackathon = useSelector(currentHackathonSelector);

  const [title, setTitle] = useState(team.title);
  const [track, setTrack] = useState(team.track?.title || '');
  const [tracks, setTracks] = useState<HackathonTrack[]>([]);

  const getTracks = async () => {
    const URL = `/hackathons/tracks/${hackathon.id}`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setTracks(res.data.tracks);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const handleCancel = ()=>setShow(false);

  const handleEdit = async ()=>{
    if (title.trim() === "" || track.trim() === "") {
      Toaster.error("title or track cannot be empty.");
      return;
    }
    const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/team/${team.id}`;
    const selectedTrack = tracks.find(trackObj=>trackObj.id === track);
    const res = await patchHandler(URL, {
      title,
      trackID: selectedTrack?.id
    })
    if (res.statusCode == 200) {
      setTeams(teams=>teams.map(teamObj=>{
        if (teamObj.id === team.id){
          return {...team, title, track: selectedTrack}
        }
        return teamObj;
      }))
      Toaster.success('Team details updated successfully');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
    setShow(false);
  }

  useEffect(() => {
    setTitle(team.title)
    getTracks();
  }, [show]);

  return (
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"font-bold"}>Edit {team.title} details</DialogTitle>
            <DialogDescription>You can only edit title and track of this team.</DialogDescription>
          </DialogHeader>
          <div className={"flex gap-2 max-sm:flex-col max-sm:gap-1.5"}>
            <div className={"w-full max-sm:space-y-0.5"}>
              <Label htmlFor={'edit-team-title'}>Title</Label>
              <Input
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                type={'text'}
                id={'edit-team-title'}
                className={"bg-neutral-100"}
              />
            </div>
            <div className={"w-full max-sm:space-y-0.5"}>
              <Label htmlFor={'edit-team-track'}>Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger id={'edit-team-track'} className="w-full bg-neutral-100">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks &&
                    tracks.map((track, index) => (
                      <SelectItem value={track.id} key={index}>
                        {track.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className={"mt-2 max-sm:gap-1"}>
            <Button variant={"outline"} onClick={handleCancel}>Cancel</Button>
            <Button variant={"destructive"} onClick={handleEdit}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

export const DeleteTeam = ({
    team,
    show,
    setShow,
    setTeams
}: TeamActionProps)=>{

  const hackathon = useSelector(currentHackathonSelector)

  const handleCancel = ()=>setShow(false);

  const handleDelete = async () => {
    console.log(team);
    const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/team/${team.id}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 200) {
      setTeams(teams=>teams.filter(teamItem=>teamItem.id != team.id))
      Toaster.success('Team removed successfully');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
    setShow(false);
  }

  return (
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={"font-bold"}><span className={"text-red-500"}>Remove</span> {team.title}</DialogTitle>
            <DialogDescription>This team will be removed from the hackathon. Are you absolutely sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter className={"mt-2 max-sm:gap-1"}>
            <Button variant={"outline"} onClick={handleCancel}>Cancel</Button>
            <Button variant={"destructive"} onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}

export default TeamProjectsTable;
