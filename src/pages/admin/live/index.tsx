import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { HackathonRound } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useMemo, useState } from 'react';
import AdminLiveRoundAnalytics from '@/sections/analytics/admin_live_round_analytics';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import BaseWrapper from '@/wrappers/base';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import NewAnnouncement from '@/sections/admin/new_announcement';
import ViewAnnouncements from '@/sections/admin/view_announcements';
import TeamProjectsTable from '@/components/tables/teams_projects';
import { useRouter } from 'next/router';
import socketService from '@/config/ws';
import { userSelector } from '@/slices/userSlice';

const Index = () => {
  const [currentRound, setCurrentRound] = useState<HackathonRound | null>(null);
  const [nextRound, setNextRound] = useState<HackathonRound | null>(null);
  const [announcementReloadTrigger, setAnnouncementReloadTrigger] = useState(false);

  const hackathon = useSelector(currentHackathonSelector);

  const router = useRouter();

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setCurrentRound(res.data.round);
      setNextRound(res.data.nextRound);

      if (!res.data.round && res.data.nextRound && res.data.nextRound.index == 0) {
        window.location.replace('/admin/stage');
      }
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    if (!hackathon) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else if (hackathon.isEnded) window.location.replace('/admin/ended');
    else if (moment().isBefore(hackathon.teamFormationEndTime)) window.location.replace('/admin/teams');
    else {
      getCurrentRound();
      socketService.connect(hackathon.id);
    }
  }, []);

  const role = useMemo(() => getHackathonRole(), []);

  const user = useSelector(userSelector);

  const isOrgUser = useMemo(
    () => user.organizationMemberships?.map(m => m.organizationID).includes(hackathon.organizationID) || hackathon.coordinators?.includes(user.id),
    [user, hackathon]
  );

  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base p-12 max-md:p-8 flex flex-col gap-8">
        <div className=" w-full h-fit flex flex-col gap-4">
          <div className="w-full flex flex-col md:flex-row items-start md:justify-between gap-6">
            <div className="--heading w-full md:w-1/2 h-full flex flex-col gap-4">
              <div className="w-full h-full max-md:text-center">
                <div className="text-xl">Now Ongoing</div>
                <div
                  style={{
                    background: '-webkit-linear-gradient(0deg, #607ee7,#478EE1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  className="text-6xl lg:text-8xl font-bold"
                >
                  {currentRound ? `Round ${currentRound.index + 1}` : 'Break'}
                </div>
                <div className="text-2xl w-3/4 max-md:w-full font-medium">
                  {currentRound ? (
                    moment().isBetween(moment(currentRound.judgingStartTime), moment(currentRound.endTime)) ? (
                      'Judging is Live!'
                    ) : (
                      moment(currentRound.judgingStartTime).isAfter(moment()) && `Judging Starts ${moment(currentRound.judgingStartTime).fromNow()}.`
                    )
                  ) : nextRound ? (
                    ` Round ${nextRound.index + 1} Starts ${moment(nextRound.startTime).fromNow()}.`
                  ) : (
                    <div className="space-y-6">
                      <div> All rounds are over.</div>
                      {hackathon.coordinators?.includes(user.id) && (
                        <Button onClick={() => router.push('/admin/live/prizes')} className="w-full" variant="destructive">
                          End Hackathon
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {(currentRound || nextRound) && (
                <div className="w-full flex max-md:flex-col gap-4">
                  {isOrgUser && <NewAnnouncement setTriggerReload={setAnnouncementReloadTrigger} />}
                  <ViewAnnouncements triggerReload={announcementReloadTrigger} />
                </div>
              )}
            </div>
            <AdminLiveRoundAnalytics currentRound={currentRound} nextRound={nextRound} />
          </div>
        </div>
        <TeamProjectsTable />
      </div>
    </BaseWrapper>
  );
};

export default Index;
