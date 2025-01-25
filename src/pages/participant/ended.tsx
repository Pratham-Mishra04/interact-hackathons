import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import { Announcement, HackathonTeam, Project, Event } from '@/types';
import Toaster from '@/utils/toaster';
import React, { useEffect, useState } from 'react';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { useSelector } from 'react-redux';
import BaseWrapper from '@/wrappers/base';
import moment from 'moment';
import Loader from '@/components/common/loader';
import { initialProject } from '@/types/initials';
import AnnouncementCard from '@/components/announcement_card';
import Link from 'next/link';
import { FRONTEND_URL } from '@/config/routes';
import Overview from '@/sections/projects/overview';
import EventCard from '@/components/event_card';

const Ended = () => {
  const [team, setTeam] = useState<HackathonTeam | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);

  const hackathon = useSelector(currentHackathonSelector);

  const getTeam = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/teams`;
    const res = await getHandler(URL, undefined, true);
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
    const res = await getHandler(`/hackathons/${hackathon.id}/participants/announcements/`, undefined, true);
    if (res.statusCode == 200) {
      setAnnouncements(res.data.announcements);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const fetchSimilarEvents = async (URL: string, setter: React.Dispatch<React.SetStateAction<Event[]>>) => {
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setter(res.data.hackathons || []);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    setLoading(false);
    if (!hackathon.id) window.location.replace(`/?redirect_url=${window.location.pathname}`);
    else {
      if (moment().isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime)))
        window.location.replace('/participant/team');
      else if (!hackathon.isEnded) window.location.replace('/participant/live');
      else {
        if (moment().isBetween(moment(hackathon.teamFormationStartTime), moment(hackathon.teamFormationEndTime)))
          window.location.replace('/participant/team');
        else if (!hackathon.isEnded) window.location.replace('/participant/live');
        else {
          getTeam();
          fetchAnnouncements();
          //TODO: SIMILAR EVENTS ROUTES
          fetchSimilarEvents(`/events/similar/${hackathon.eventID}`, setSimilarEvents);
        }
      }
    }
  }, []);

  return (
    <BaseWrapper>
      {team ? (
        <div className="w-full min-h-base bg-[#E1F1FF] p-6  flex flex-col items-center gap-10">
          <div className={'flex max-lg:flex-col sm:w-10/12 gap-10'}>
            <div className="w-full flex flex-col md:flex-row gap-8">
              <div className="w-full flex flex-col gap-2 items-center justify-center">
                <div className="w-fit i flex flex-col font-bold">
                  <h4 className="text-4xl lg:text-5xl text-start">{team.title}</h4>
                  <div className="w-full text-7xl lg:text-8xl font-bold gradient-text-3 text-center">Hackathon</div>
                  <div className="w-full flex flex-col text-right text-2xl lg:text-3xl">ENDED!</div>
                </div>
              </div>
            </div>
            <ResumeProject project={team.project || initialProject} />
            {/*<EndOverviewComponent project={team.project || initialProject} />*/}
          </div>
          <div className={'sm:w-10/12'}>
            <Overview project={team.project || initialProject} setTeam={() => {}} />
            {/*<ProjectDetails project={team.project || initialProject} />*/}
          </div>
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
        <div className="w-full min-h-base h-full px-20 max-lg:px-10 max-md:px-5 py-5 space-y-10">
          <div className={'flex flex-col items-center gap-3'}>
            <div className={'text-8xl max-lg:text-7xl max-md:text-6xl font-bold text-neutral-800'}>Team</div>
            <div className={'text-7xl max-lg:text-6xl max-md:text-5xl text-nowrap font-bold gradient-text-3 pb-4'}>not registered</div>
            <div className={'text-3xl max-lg:text-2xl max-md:text-xl text-nowrap font-bold text-neutral-800'}>For this hackathon/Events</div>
          </div>
          {similarEvents.length > 0 && (
            <div className={'w-full'}>
              <div className={'text-3xl max-lg:text-2xl max-md:text-xl font-bold text-neutral-800'}>More Events Like This:</div>
              <div className={'w-full grid grid-cols-4 gap-5 mt-2  max-md:grid-cols-2 max-sm:grid-cols-1 justify-items-center'}>
                {similarEvents.slice(0, 4).map(event => (
                  <EventCard event={event} key={event.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </BaseWrapper>
  );
};

const ResumeProject = ({ project }: { project: Project }) => {
  return (
    <div className="w-full text-white px-4 py-6 rounded-lg shadow-md space-y-2 text-center bg-gradient-to-r from-[#4B9EFF] to-[#2D5F99] flex flex-col items-center">
      <h2 className="text-3xl font-bold">Resume Your Project</h2>
      <p className="text-lg font-medium">Your project has a platform to thrive, Now live on interact.</p>
      <p>Invite new members, expand your team, and watch it grow with all the feature at your fingertips.</p>
      <Link
        href={`${FRONTEND_URL}/workspace?pid=${project?.id}`}
        className="block font-medium bg-white hover:bg-white/90 shadow-sm text-black py-3 w-1/2 rounded-xl"
      >
        Workspace
      </Link>
      <p className={'text-lg font-bold'}>Click here to open your project workspace</p>
    </div>
  );
};

export default Ended;
