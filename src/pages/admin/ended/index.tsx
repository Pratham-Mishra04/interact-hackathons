import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { HackathonTeam } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
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

const Index = () => {
  const hackathon = useSelector(currentHackathonSelector);
  const [loading, setLoading] = useState(false);

  const [announcementReloadTrigger, setAnnouncementReloadTrigger] = useState(false);

  useEffect(() => {
    const role = getHackathonRole();
    if (role != 'admin' && role != 'org') window.location.replace('/?action=sync');
    else if (moment().isBefore(hackathon.teamFormationEndTime)) window.location.replace('/admin/teams');
    else if (!hackathon.isEnded) window.location.replace('/admin/live');
  }, []);

  const handleDownload = async (downloadType: 'team' | 'overall' | 'round', roundID?: string, roundIndex?: number) => {
    if (loading) return;
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
          if (!roundID || !roundIndex) isValid = false;
          else {
            URL += `/rounds/${roundID}`;
            filename += `_round-${roundID}-scores`;
          }
          break;
        default:
          isValid = false;
      }

      if (!isValid) return;

      setLoading(true);

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
    } catch (error) {
      Toaster.error(SERVER_ERROR);
      console.error('Error downloading CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base p-12 max-md:p-8 flex flex-col gap-8">
        <div className=" w-full h-fit flex flex-col gap-4">
          <div className="w-full flex flex-col md:flex-row items-start md:justify-between gap-6">
            <div className="--heading w-full h-full flex flex-col gap-8">
              <section className="w-full h-full text-center text-2xl md:text-3xl lg:text-5xl font-bold lg:leading-[4.5rem]">
                <h1>
                  The Hackathon has <span className={"text-4xl md:text-5xl gradient-text-3 lg:text-8xl block"}>Ended</span>
                </h1>
              </section>
              <div className="w-full flex gap-4 justify-center">
                <NewAnnouncement setTriggerReload={setAnnouncementReloadTrigger} triggerClass={"w-1/4"} />
                <ViewAnnouncements triggerReload={announcementReloadTrigger} triggerClass={"w-fit"} trigger={
                  <button className={"button-gradient rounded-lg h-full p-1 px-2 text-white"}><HistoryIcon className={"size-5"} /></button>
                } />
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="text-xl font-bold max-md:text-center">Event Reports (in CSV)</div>
                <div className="w-full flex gap-4 max-md:flex-col max-md:items-center relative">
                  {loading && (
                    <div className="w-full h-full bg-white flex-center absolute top-0 right-0 bg-opacity-50 rounded-lg">
                      <Loader />
                    </div>
                  )}
                  <Button onClick={() => handleDownload('team')} className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white" variant={'default'}>
                    <div className="font-semibold">Team Details</div>
                  </Button>
                  <Button onClick={() => handleDownload('overall')} className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white" variant={'default'}>
                    <div className="font-semibold">Overall Team Scores</div>
                  </Button>
                  <Button className="w-1/2 max-md:w-11/12 bg-blue-prime hover:bg-blue-prime/75 text-white" variant={'default'} disabled={true}>
                    <div className="font-semibold">Round Wise Team Scores</div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"max-md:mt-4"}><TeamProjectsTable /></div>
      </div>
    </BaseWrapper>
  );
};

export default Index;
