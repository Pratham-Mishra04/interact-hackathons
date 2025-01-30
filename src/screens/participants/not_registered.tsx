import React from 'react';
import SimilarEvents from './similar_events';

const TeamNotRegistered = () => {
  return (
    <div className="w-full min-h-base p-12 max-md:pt-12 max-md:p-6 space-y-16">
      <div className="w-full flex-center flex-col gap-4 max-md:gap-2">
        <div className="w-fit mx-auto text-center font-semibold">
          <span className="w-fit text-gradient text-6xl md:text-9xl">Team</span> <br />{' '}
          <span className="w-fit blue-text-gradient text-4xl md:text-7xl">Not Registered</span>
        </div>
        <div className="text-2xl font-medium">For this Hackathon</div>
      </div>
      <SimilarEvents />
    </div>
  );
};

export default TeamNotRegistered;
