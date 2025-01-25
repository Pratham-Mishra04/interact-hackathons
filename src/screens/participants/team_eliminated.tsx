import React, { useEffect, useState } from 'react';
import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import { HackathonTeam, Event } from '@/types';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import getHandler from '@/handlers/get_handler';
import Link from 'next/link';

interface TeamEliminatedProps {
  team: HackathonTeam;
}

const TeamEliminated: React.FC<TeamEliminatedProps> = ({ team }) => {
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchSimilarEvents = async () => {
      const URL = `/explore/events/similar/${hackathon.eventID}`;
      const res = await getHandler(URL, undefined, true);
      if (res.statusCode === 200) {
        setSimilarEvents(res.data.events);
      }
    };

    fetchSimilarEvents();
  }, [hackathon.eventID]);

  return (
    <div className="flex justify-start items-start flex-col w-full m-4 md:m-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-center items-center w-full font-primary">
        <div className="flex flex-col justify-start items-start w-full md:w-1/2">
          <div className="font-bold">
            <h4 className="gradient-text text-4xl md:text-6xl mb-2">Team {team.title}</h4>
            <h1 className="text-6xl md:text-9xl gradient-text-2">Eliminated</h1>
          </div>
          <div className="mt-5 flex justify-center items-center space-x-4 md:space-x-6 font-bold">
            <button className="px-4 md:px-8 py-2 md:py-4 rounded-full shadow-md bg-white text-lg">Thank You</button>
            <button className="px-4 md:px-8 py-2 md:py-4 rounded-full shadow-md button-gradient text-white text-lg">Report</button>
          </div>
          <div>
            <h6 className="font-semibold text-xl md:text-2xl mt-4 md:mt-8">
              Continue your project, access it in the{' '}
              <Link href="https://www.interactnow.in" className="text-blue-500">
                workspace
              </Link>
              .
            </h6>
          </div>
        </div>
        <div className="flex justify-center items-center w-full md:w-1/2 mt-8 md:mt-0">
          <TeamOverviewAnalytics />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start mt-12 md:mt-24">
        <h2 className="font-bold font-primary text-2xl md:text-4xl mb-4 md:mb-6">More Events Like This: </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarEvents.map((event, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
              <h3 className="text-lg md:text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-700">{event.description}</p>
              <Link href={`/events/${event.id}`} className="text-blue-500 mt-2 inline-block">
                View Event
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamEliminated;
