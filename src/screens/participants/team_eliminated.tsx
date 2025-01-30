import React from 'react';
import TeamOverviewAnalytics from '@/sections/analytics/team_overview';
import { HackathonTeam, Event } from '@/types';
import Link from 'next/link';
import SimilarEvents from './similar_events';
import { FRONTEND_URL } from '@/config/routes';

interface TeamEliminatedProps {
  team: HackathonTeam;
}

const TeamEliminated: React.FC<TeamEliminatedProps> = ({ team }) => {
  return (
    <div className="w-full min-h-base p-12 max-md:pt-12 max-md:p-6 space-y-16">
      <div className="w-full flex-center flex-col gap-4">
        <div className="w-fit flex-center flex-col">
          <h4 className="w-fit text-gradient text-5xl font-semibold">Team {team.title}</h4>
          <h1 className="w-fit text-6xl md:text-9xl gradient-text-2">Eliminated</h1>
        </div>

        <h6 className="font-semibold text-xl md:text-2xl">
          Continue your project, access it in{' '}
          <Link href={`${FRONTEND_URL}/projects?tab=workspace`} className="text-blue-500">
            your workspace
          </Link>
          .
        </h6>
      </div>
      <SimilarEvents />
    </div>
  );
};

export default TeamEliminated;
