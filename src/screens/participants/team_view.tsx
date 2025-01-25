import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableCaption } from '@/components/ui/table';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { userSelector } from '@/slices/userSlice';
import { HackathonTeam, HackathonTrack } from '@/types';
import { Blueprint, Trash } from '@phosphor-icons/react';
import moment from 'moment';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Separator from '@/components/ui/separator';

interface Props {
  team: HackathonTeam;
  onLeaveTeam?: () => void;
  onDeleteTeam?: () => void;
  onKickMember?: (userID: string) => void;
  tracks?: HackathonTrack[] | null;
  onUpdateTeam?: (formData: any) => void;
  actions?: boolean;
}

const TeamView = ({ team, onLeaveTeam, onDeleteTeam, onKickMember, onUpdateTeam, tracks, actions = true }: Props) => {
  const user = useSelector(userSelector);
  const [track, setTrack] = useState(team.trackID ?? '');
  const [initialRender, setInitialRender] = useState(true);
  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    if (track && track.length > 0 && onUpdateTeam) {
      if (!initialRender) {
        onUpdateTeam({
          trackID: track,
          title: team.title,
          hackathonID: team.hackathonID,
        });
      }
    }
    setInitialRender(false);
  }, [track]);

  return (
    <div
      className={`w-full space-y-4 p-3 md:p-6 bg-white rounded-xl shadow-md ${actions ? 'hover:shadow-xl' : 'hover:shadow-lg'} transition-ease-300`}
    >
      {actions ? (
        <div className="w-full flex flex-col gap-4 md:flex-row items-center justify-between">
          {tracks && tracks.length > 0 && (
            <div className="w-full md:w-fit flex items-center gap-2">
              <p className="text-nowrap">Your Track: </p>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger className="w-full min-w-40">
                  <SelectValue placeholder="Select Track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((track, index) => (
                    <SelectItem value={track.id} key={index}>
                      {track.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="w-full md:w-fit flex items-center justify-between md:justify-start gap-5">
            <div className="text-sm font-medium">
              Members {team.memberships?.length}/{hackathon.maxTeamSize}
            </div>
            {user.id != team.userID && onLeaveTeam && (
              <AlertDialog>
                <AlertDialogTrigger>Open</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You may not be able to join the team again if it reaches the capacity.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onLeaveTeam}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {user.id == team.userID && (
              <AlertDialog>
                <AlertDialogTrigger>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button disabled={team.memberships.length > 1} variant="destructive">
                          <p className="hidden md:inline-block">Delete Team</p>
                          <Trash className="md:ml-2 cursor-pointer" size={20} />
                        </Button>
                      </TooltipTrigger>
                      {team.memberships.length > 1 && <TooltipContent>Remove all members to delete the team.</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. Your Team will be deleted permanently.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteTeam}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
            <Blueprint size={32} />
            <div>Selected Track: {team.track?.title}</div>
          </div>
          <Separator className="border-primary_text" />
        </div>
      )}

      <Table>
        <TableCaption>
          Created By <b>{team.user.name}</b> at {moment(team.createdAt).format('hh:mm a, DD MMMM')}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="max-md:hidden">Joined At</TableHead>
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.memberships?.map(membership => {
            const member = membership.user;
            return (
              <TableRow key={member.id}>
                <TableCell className="flex items-center gap-2 font-medium">
                  <Image
                    width={50}
                    height={50}
                    src={`${USER_PROFILE_PIC_URL}/${member.profilePic}`}
                    alt={member.username}
                    className="w-8 h-8 rounded-full object-cover hidden md:block"
                  />
                  <div className="flex items-center gap-1">
                    <div className="text-sm md:text-lg">{member.name}</div>
                    <div className="text-gray-500 hidden md:block">@{member.username}</div>
                  </div>
                </TableCell>
                <TableCell>{membership.role}</TableCell>
                <TableCell className="max-md:hidden">{moment(membership.createdAt).format('hh:mm a, DD MMMM')}</TableCell>
                {actions && (
                  <TableCell>
                    <div className="w-full h-full flex justify-end gap-4">
                      {member.id != user.id && user.id == team.userID && (
                        <>
                          {onKickMember && (
                            <Trash
                              onClick={() => {
                                if (onKickMember) onKickMember(member.id);
                              }}
                              className="text-primary_danger cursor-pointer"
                              size={20}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamView;
