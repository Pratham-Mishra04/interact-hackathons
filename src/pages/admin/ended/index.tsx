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
import { Loader } from 'lucide-react';
import TeamProjectsTable from '@/components/tables/teams_projects';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Index = () => {
  const hackathon = useSelector(currentHackathonSelector);
  const [clickedOnNewAnnouncement, setClickedOnNewAnnouncement] = useState(false);
  const [clickedOnViewAnnouncement, setClickedOnViewAnnouncement] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else if (!hackathon.isEnded) window.location.replace('/admin/live');
    else if (moment().isBefore(hackathon.teamFormationEndTime)) window.location.replace('/admin/teams');
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
              <section className="w-full h-full text-center text-3xl md:text-4xl lg:text-7xl font-bold lg:leading-[4.5rem]">
                <h1
                  style={{
                    background: '-webkit-linear-gradient(0deg, #607ee7,#478EE1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  The Hackathon has ended
                </h1>
              </section>
              <div className="w-full flex gap-4 max-md:flex-col">
                <Button onClick={() => setClickedOnNewAnnouncement(true)} className="w-1/2 bg-primary_text">
                  <div className="">Create New Announcement</div>
                </Button>
                <Button onClick={() => setClickedOnViewAnnouncement(true)} className="w-1/2 bg-primary_text">
                  <div className="">View All Announcements</div>
                </Button>
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="text-xl font-semibold">Event Reports (in CSV)</div>
                <div className="w-full flex gap-4 max-md:flex-col relative">
                  {loading && (
                    <div className="w-full h-full bg-white flex-center absolute top-0 right-0 bg-opacity-50 rounded-lg">
                      <Loader />
                    </div>
                  )}
                  <Button onClick={() => handleDownload('team')} className="w-1/2 bg-priority_low" variant={'link'}>
                    <div className="font-semibold">Team Details</div>
                  </Button>
                  <Button onClick={() => handleDownload('overall')} className="w-1/2 bg-priority_low" variant={'link'}>
                    <div className="font-semibold">Overall Team Scores</div>
                  </Button>
                  <Button className="w-1/2 bg-priority_low text-primary_black" variant={'default'} disabled={true}>
                    <div className="font-semibold">Round Wise Team Scores</div>
                  </Button>
                  {/* <Button onClick={() => handleDownload('round')} className="w-1/2 bg-priority_low" variant={'link'}>
                      <Select value={''} onValueChange={()=>}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Your Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleRoleData.map((role, index) => (
                            <SelectItem value={role} key={index}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="">Round Wise Team Scores</div>
                    </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TeamProjectsTable />
      </div>
    </BaseWrapper>
  );
};

export default Index;
