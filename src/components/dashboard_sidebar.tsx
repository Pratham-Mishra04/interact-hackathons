import { Blueprint, UsersThree } from '@phosphor-icons/react';
import { ArrowLeft } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HackathonTeam } from '@/types';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import patchHandler from '@/handlers/patch_handler';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import Status from './common/status';
import { useRouter } from 'next/router';

interface Props {
  data: {
    title: string;
    Icon: React.ComponentType;
    Screen: JSX.Element;
  }[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  team: HackathonTeam;
  setTeam: Dispatch<SetStateAction<HackathonTeam>>;
}
const DashboardSidebar = ({ data, activeIndex, setActiveIndex, team, setTeam }: Props) => {
  const hackathon = useSelector(currentHackathonSelector);
  const [clickedOnEliminate, setClickedOnEliminate] = useState(false);

  const handleEliminateTeam = async () => {
    const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/team/${team.id}/eliminate`;

    const res = await patchHandler(URL, {});
    const message = res.data.message || SERVER_ERROR;
    if (res.statusCode == 200) {
      setTeam(prev => {
        return { ...prev, isEliminated: !prev.isEliminated };
      });
      setClickedOnEliminate(false);
      Toaster.success(message);
    } else Toaster.error(message);
  };

  const role = getHackathonRole();

  const router = useRouter();

  return (
    <div className="w-[12%] md:w-[20%] sticky top-16 left-0 bg-white h-base px-2 md:p-3 md:flex flex-col justify-between">
      <div className="w-full">
        <section className="--team-details hidden md:flex flex-col gap-2 pb-4 border-b-[2px] border-primary_text">
          <h1 className="text-2xl font-semibold">{team.title}</h1>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="text-base font-semibold text-primary_text flex items-center w-full gap-1">
              <Blueprint size={24} /> <p className="text-primary_black truncate w-full ">{team.track?.title}</p>
            </h2>
            <h2 className="text-base font-semibold text-primary_text flex items-center gap-1">
              <UsersThree size={24} />
              <span className="text-primary_black">{team.memberships?.length} Members</span>
            </h2>
          </div>
          <Status className="rounded-md mt-6 text-sm py-2 cursor-default" status={team.isEliminated ? 'eliminated' : 'not eliminated'} />
        </section>
        <section className="--menu-items flex flex-col gap-4 md:gap-2 mt-4">
          {data.map((item, index) => (
            <button
              className={`flex items-center justify-center md:justify-start gap-2 h-8 md:h-fit w-full md:py-2 rounded-sm md:px-3  hover:bg-blue-300 hover:text-white  ${
                activeIndex === index ? 'bg-primary_text text-white' : 'text-primary_black/80'
              } transition-ease-300`}
              key={index}
              onClick={() => {
                setActiveIndex(index);
              }}
            >
              <item.Icon />
              <span className="font-semibold hidden md:block ">{item.title}</span>
            </button>
          ))}
        </section>
      </div>
      <div className="w-full flex flex-col gap-2">
        {role == 'admin' && !hackathon.isEnded && (
          <Dialog open={clickedOnEliminate} onOpenChange={setClickedOnEliminate}>
            <DialogTrigger
              className={`${
                team.isEliminated ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'
              } text-white py-2 rounded-md transition-ease-300`}
            >
              {team.isEliminated ? 'Restore' : 'Eliminate'} Team
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-left">
                <DialogTitle>{team.isEliminated ? 'Restore' : 'Eliminate'} Team</DialogTitle>
                <DialogDescription>
                  This action can be undone.{' '}
                  {team.isEliminated ? 'This will get the team back in the competition.' : 'This will remove the team from the competition.'}
                </DialogDescription>
              </DialogHeader>
              <Button onClick={handleEliminateTeam} variant={team.isEliminated ? 'default' : 'destructive'}>
                {team.isEliminated ? 'Restore' : 'Eliminate'} Team
              </Button>
              <DialogFooter>
                If Judging is live, the action will be reflected after the judging ends, else it will be reflected immediately.
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Button onClick={() => router.back()} className="bg-primary_text mt-6 transition-ease-300">
          <span className="hidden md:block">Go Back</span>
          <span className="md:hidden">
            <ArrowLeft size={16} />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
