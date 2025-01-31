import { Link, Warning } from '@phosphor-icons/react';
import Image from 'next/image';
import React from 'react';

const FigmaIntegration = ({ isParticipant = false }: { isParticipant?: boolean }) => {
  return (
    <div className="w-full h-[78px] flex items-center gap-2 bg-white p-2 rounded-l-full rounded-r-xl space-y-2">
      <Image src="/assets/figma.png" width={64} height={64} alt="" />
      <div className="grow space-y-1">
        <div className="w-full flex items-center gap-2 text-sm font-medium">
          <Warning className="text-primary_danger" size={24} />
          Figma Integrations disabled for this Hackathon.
        </div>
        {isParticipant && (
          <div className="w-full flex items-center gap-2 text-xs">
            <Link className="text-primary_text" size={24} />
            Include your Figma Links in the Project Submission.
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmaIntegration;
