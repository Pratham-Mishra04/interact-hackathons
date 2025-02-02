import React, { ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import Image from 'next/image';
import { FRONTEND_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { HackathonTeamMembership, User } from '@/types';
import Link from 'next/link';

const TeamMemberHoverCard = ({ trigger, membership }: { trigger: ReactNode; membership: HackathonTeamMembership }) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-64 p-2">
        <Link href={`${FRONTEND_URL}/users/${membership.user.username}`} className="flex items-center space-x-1">
          <Image
            crossOrigin="anonymous"
            width={100}
            height={100}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${membership.user.profilePic}`}
            className="w-12 h-12 rounded-full"
          />
          <div className="w-[calc(100%-48px)]">
            <div className="w-fit flex-center gap-1">
              <h4 className="text-lg font-semibold">{membership.user.name}</h4>
              <h4 className="text-xs font-medium text-gray-500">@{membership.user.username}</h4>
            </div>
            <p className="text-sm">{membership.role}</p>
          </div>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};

export default TeamMemberHoverCard;
