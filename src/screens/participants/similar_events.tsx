import EventCard from '@/components/event_card';
import getHandler from '@/handlers/get_handler';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { Event } from '@/types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const SimilarEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const hackathon = useSelector(currentHackathonSelector);

  useEffect(() => {
    const fetchSimilarEvents = async () => {
      const URL = `/explore/events/similar/${hackathon.eventID}`;
      const res = await getHandler(URL, undefined, true);
      if (res.statusCode === 200) {
        setEvents(res.data.events);
      }
    };

    fetchSimilarEvents();
  }, [hackathon.eventID]);
  return (
    <div className="w-full space-y-4">
      <h2 className="w-full font-semibold text-xl max-md:text-center">More Events Like This: </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((event, index) => event.hackathonID && event.hackathon && <EventCard key={index} event={event} />)}
      </div>
    </div>
  );
};

export default SimilarEvents;
