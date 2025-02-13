import { SERVER_ERROR } from '@/config/errors';
import Toaster from '@/utils/toaster';
import React, { useEffect, useMemo, useState } from 'react';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import { ORG_URL } from '@/config/routes';
import BaseWrapper from '@/wrappers/base';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import NewAnnouncement from '@/sections/admin/new_announcement';
import ViewAnnouncements from '@/sections/admin/view_announcements';
import configuredAxios from '@/config/axios';
import { HistoryIcon, Loader } from 'lucide-react';
import TeamProjectsTable from '@/components/tables/teams_projects';
import { userSelector } from '@/slices/userSlice';
import getHandler from '@/handlers/get_handler';
import { HackathonRound } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const hackathon = useSelector(currentHackathonSelector);
  const [rounds, setRounds] = useState<HackathonRound[]>([]);
  const [loading, setLoading] = useState(false);

  const [announcementReloadTrigger, setAnnouncementReloadTrigger] = useState(false);

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else if (!hackathon.isEnded) window.location.replace('/admin/live');
    else if (moment().isBefore(hackathon.teamFormationEndTime)) window.location.replace('/admin/teams');
    else getRounds();
  }, []);

  const handleDownload = async (downloadType: 'team' | 'overall' | 'round' | 'prize' | 'logs', roundID?: string, roundIndex?: number) => {
    const toaster = Toaster.startLoad('Downloading CSV...');
    if (loading) return;
    setLoading(true);

    try {
      let URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/csv`;
      let filename = hackathon.title.replaceAll(' ', '_');

      var isValid = true;

      switch (downloadType) {
        case 'team':
          URL += '/teams';
          filename += '_teams';
          break;
        case 'overall':
          URL += '/scores';
          filename += '_overall-scores';
          break;
        case 'round':
          if (!roundID || roundIndex == undefined) isValid = false;
          else {
            URL += `/rounds/${roundID}`;
            filename += `_round-${roundIndex + 1}-scores`;
          }
          break;
        case 'prize':
          URL += '/prizes';
          filename += '_prizes';
          break;
        case 'logs':
          URL += '/logs';
          filename += 'logs';
        default:
          isValid = false;
      }

      const response = await configuredAxios.get(URL, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename + '.csv');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      Toaster.stopLoad(toaster, 'CSV Downloaded', 1);
    } catch (error) {
      Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      console.error('Error downloading CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRounds = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/rounds`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode === 200) {
      const rounds: HackathonRound[] = res.data.rounds || [];
      setRounds(rounds.sort((a, b) => b.index - a.index));
    } else {
      Toaster.error(res.data?.message || SERVER_ERROR);
    }
  };

  const user = useSelector(userSelector);

  const isOrgUser = useMemo(
    () => user.organizationMemberships?.map(m => m.organizationID).includes(hackathon.organizationID),
    [user.organizationMemberships, hackathon.organizationID]
  );

  const role = getHackathonRole();

  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base p-12 max-md:p-8 flex flex-col gap-8">
        <div className=" w-full h-fit flex flex-col gap-4">
          <div className="w-full flex flex-col md:flex-row items-start md:justify-between gap-6">
            <div className="--heading w-full h-full flex flex-col gap-8">
              <section className="w-full h-full text-center text-2xl md:text-3xl lg:text-5xl font-bold lg:leading-[4.5rem]">
                <h1>
                  The Hackathon has <span className={'text-4xl md:text-5xl gradient-text-3 lg:text-9xl block'}>Ended</span>
                </h1>
              </section>
              <div className="w-full flex gap-4 justify-center">
                {isOrgUser && <NewAnnouncement setTriggerReload={setAnnouncementReloadTrigger} triggerClass={'w-1/4'} />}
                <ViewAnnouncements
                  triggerReload={announcementReloadTrigger}
                  triggerClass={'w-fit'}
                  trigger={
                    <button className={'button-gradient rounded-lg h-full p-2 text-white'}>
                      <HistoryIcon size={24} />
                    </button>
                  }
                />
              </div>
              {hackathon.coordinators?.includes(user.id) && (
                <div className="w-full flex flex-col gap-2">
                  <div className="text-xl font-bold max-md:text-center">Event Reports (in CSV)</div>
                  <div className="w-full flex gap-4 max-md:flex-col max-md:items-center relative">
                    {loading && (
                      <div className="w-full h-full bg-white flex-center absolute top-0 right-0 bg-opacity-50 rounded-lg">
                        <Loader />
                      </div>
                    )}
                    <Button
                      onClick={() => handleDownload('team')}
                      className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white"
                      variant={'default'}
                    >
                      <div className="font-semibold">Team Details</div>
                    </Button>
                    {role == 'admin' && (
                      <>
                        <Button
                          onClick={() => handleDownload('overall')}
                          className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white"
                          variant={'default'}
                        >
                          <div className="font-semibold">Overall Team Scores</div>
                        </Button>
                        {rounds && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="w-1/2 max-md:w-11/12">
                              <Button
                                onClick={() => handleDownload('round')}
                                className="w-full bg-blue-prime hover:bg-blue-prime/75 text-white"
                                variant={'default'}
                              >
                                <div className="font-semibold">Round Wise Team Scores</div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Select Round</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {rounds.map(round => (
                                <DropdownMenuItem key={round.id} onClick={() => handleDownload('round', round.id, round.index)}>
                                  Round {round.index + 1}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button
                          onClick={() => handleDownload('prize')}
                          className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white"
                          variant={'default'}
                        >
                          <div className="font-semibold">Prize Distribution</div>
                        </Button>
                        <Button
                          onClick={() => handleDownload('logs')}
                          className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white"
                          variant={'default'}
                        >
                          <div className="font-semibold">Logs</div>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={'max-md:mt-4'}>
          <TeamProjectsTable />
        </div>
      </div>
    </BaseWrapper>
  );
};

export default Index;
