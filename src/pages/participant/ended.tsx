import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { Announcement, HackathonTeam } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import BaseWrapper from '@/wrappers/base';
import moment from 'moment';
import Loader from '@/components/common/loader';
import { initialProject } from '@/types/initials';
import EndOverviewComponent from '@/sections/projects/end_overview';
import AnnouncementCard from '@/components/announcement_card';

const Ended = () => {
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const hackathon = useSelector(currentHackathonSelector);

  const getTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams`;
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      const team = res.data.team;
      if (!team) Toaster.error('Team Not Found');
      else setTeam(team);
      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const fetchAnnouncements = async () => {
    const res = await getHandler(`/hackathons/${hackathon.id}/participants/announcements/`);
    if (res.statusCode == 200) {
      setAnnouncements(res.data.announcements);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    if (!hackathon.id) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      if (moment().isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime)))
        window.location.replace('/participant/team');
      else if (!hackathon.isEnded) window.location.replace('/participant/live');
      else {
        getTeam();
        fetchAnnouncements();
      }
    }
  }, []);

  return (
    <BaseWrapper>
      {team ? (
        <div className="w-full min-h-base bg-[#E1F1FF] p-6  flex flex-col gap-10">
          <div className="w-full flex flex-col md:flex-row gap-8">
            <div className="w-full flex flex-col gap-2">
              <div className="w-full text-center i text-4xl md:text-6xl lg:text-10xl flex flex-col items-center font-bold">
                <div className="font-bold">
                  <h4 className="gradient-text-3 text-7xl mb-2">Team {team.title}</h4>
                </div>
                <div className="w-fit flex flex-col">
                  <div className="w-fit text-lg md:text-4xl lg:text-8xl font-bold gradient-text-2">The Hackathon has ended</div>
                </div>
              </div>
            </div>
          </div>
          <EndOverviewComponent project={team.project || initialProject} />
          {announcements && announcements.length > 0 && (
            <div className="w-4/5 h-full mx-auto">
              <div className="text-xl font-semibold mb-2">Announcements</div>
              {announcements.map(announcement => (
                <div key={announcement.id} className="pb-2">
                  <AnnouncementCard announcement={announcement} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="w-full h-base flex-center">
          <Loader />
        </div>
      ) : (
        <div className="text-4xl font-medium mx-auto py-16 text-primary_danger">Team not registered for this Hackathon.</div>
      )}
    </BaseWrapper>
  );
};

export default Ended;
