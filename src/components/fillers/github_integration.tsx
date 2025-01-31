import { Link, Warning } from '@phosphor-icons/react';
import Image from 'next/image';
import React from 'react';

const GithubIntegration = ({ isParticipant = false }: { isParticipant?: boolean }) => {
  return (
    <div className="w-full h-[78px] flex items-center gap-2 bg-white p-2 rounded-l-full rounded-r-xl space-y-2">
      <Image src="/assets/github.png" width={64} height={64} alt="" />
      <div className="grow space-y-1">
        <div className={`w-full flex items-center gap-2 ${isParticipant ? 'text-xs' : 'text-sm'}`}>
          <Warning className="text-primary_danger" size={isParticipant ? 20 : 24} /> Github Integrations disabled for this Hackathon.
        </div>
        {isParticipant && (
          <div className="w-full flex items-center gap-2 text-xs">
            <Link className="text-primary_text" size={20} /> Include your Github Repos in the Project Submission.
          </div>
        )}
      </div>
    </div>
  );
};

export default GithubIntegration;
