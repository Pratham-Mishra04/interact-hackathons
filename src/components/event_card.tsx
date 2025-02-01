import React, { useState } from 'react';
import { Event, Hackathon, HackathonRound, Organization } from '@/types';
import Image from 'next/image';
import { EVENT_PIC_URL, FRONTEND_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import UserHoverCard from './user_hover_card';
import { useRouter } from 'next/router';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import {
  getHackathonStage,
  HACKATHON_COMPLETED,
  HACKATHON_LIVE,
  HACKATHON_NOT_STARTED,
  HACKATHON_TEAM_ENDED,
  HACKATHON_TEAM_REGISTRATION,
} from '@/utils/funcs/hackathons';
import { useDispatch } from 'react-redux';
import { setCurrentHackathon } from '@/slices/hackathonSlice';
import { formatPrice } from '@/utils/funcs/misc';
import { Id } from 'react-toastify';
import { EVENT_PIC_HASH_DEFAULT } from '@/config/constants';
import Link from 'next/link';

interface CommonProps {
  hackathon: Hackathon;
  organization: Organization;
  isExplore?: boolean;
}

const getFormattedDate = (date?: Date) => {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  return `${parsedDate.getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(parsedDate)}`;
};

const getPrizeAmount = (prizes?: { amount: number }[]) =>
  prizes && prizes.length ? '₹' + formatPrice(prizes.reduce((acc, prize) => acc + prize.amount, 0)) : 'N/A';

const getTeamSize = (min?: number, max?: number) => (min && max ? `${min}-${max}` : 'N/A');

const getDurationInHours = (startTime?: Date, endTime?: Date) => {
  if (!startTime || !endTime) return 'N/A';
  const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
  return `${Math.ceil(durationHours)} hours`;
};

const LowerCardItem = ({ title, content }: { title: string; content: string }) => (
  <div className="flex flex-col items-center gap-0.5">
    <p className="text-gray-500 font-medium dark:text-gray-300">{title}</p>
    <p className="text-center text-sm line-clamp-1">{content}</p>
  </div>
);

const Card = ({ data, onClick }: { data: CommonProps; onClick?: () => void }) => {
  const className =
    'relative w-full max-w-md bg-white dark:bg-dark_primary_comp_hover rounded-3xl p-4 hover:shadow-xl transition-ease-300 cursor-pointer';

  const cardContent = (
    <>
      <div className="relative">
        <Image
          width={400}
          height={200}
          src={`${EVENT_PIC_URL}/${data.hackathon.coverPic}`}
          alt="Event Pic"
          className="w-full rounded-2xl mb-4"
          placeholder="blur"
          blurDataURL={`${EVENT_PIC_URL}/${data.hackathon.blurHash}?w=10&h=5&hash=${EVENT_PIC_HASH_DEFAULT}`}
        />
        <div className="absolute bottom-[-10px] -left-4">
          <UserHoverCard
            trigger={
              <div className="bg-white dark:bg-dark_primary_comp_hover rounded-full p-3">
                <Image
                  crossOrigin="anonymous"
                  width={100}
                  height={100}
                  alt={'User Pic'}
                  src={`${USER_PROFILE_PIC_URL}/${data.organization.user.profilePic}`}
                  className="w-10 h-10 rounded-full mt-1"
                />
              </div>
            }
            user={data.organization.user}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold line-clamp-1">{data.hackathon.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{data.hackathon.tagline}</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <LowerCardItem title="Prize" content={getPrizeAmount(data.hackathon.prizes || [])} />
          <LowerCardItem title="Team" content={getTeamSize(data.hackathon.minTeamSize, data.hackathon.maxTeamSize)} />
          <LowerCardItem title="Date" content={getFormattedDate(data.hackathon.startTime)} />
        </div>
      </div>
    </>
  );
  return data.isExplore ? (
    <Link href={`${FRONTEND_URL}/events/${data.hackathon.eventID}`} className={className}>
      {cardContent}
    </Link>
  ) : (
    <div onClick={onClick} className={className}>
      {cardContent}
    </div>
  );
};

const EventCard = ({ event }: { event: Event }) =>
  event.hackathonID &&
  event.hackathon && (
    <Card
      data={{
        hackathon: event.hackathon,
        organization: event.organization,
        isExplore: true,
      }}
    />
  );

export const HackathonCard = ({ hackathon, isAdmin }: { hackathon: Hackathon; isAdmin?: boolean }) => {
  const [mutex, setMutex] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode === 200) {
      return [res.data.round, res.data.nextRound];
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const buildURL = (toasterID: Id, currentRound: HackathonRound, nextRound: HackathonRound) => {
    let URL = isAdmin ? 'admin' : 'participant';
    switch (getHackathonStage(hackathon, true, currentRound, nextRound)) {
      case HACKATHON_NOT_STARTED:
        Toaster.stopLoad(toasterID, "Hackathon hasn't started.", 0);
        return '#';
      case HACKATHON_TEAM_REGISTRATION:
        URL += isAdmin ? '/teams' : '/team';
        break;
      case HACKATHON_TEAM_ENDED:
        URL += '/stage';
        break;
      case HACKATHON_LIVE:
        URL += '/live';
        break;
      case HACKATHON_COMPLETED:
        URL += '/ended';
        break;
    }
    Toaster.stopLoad(toasterID, 'Hackathon loaded! Redirecting to dashboard...', 1);
    return URL;
  };

  const handleClick = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Fetching Hackathon details...');
    dispatch(setCurrentHackathon(hackathon));
    const [currentRound, nextRound] = (await getCurrentRound()) || [undefined, undefined];
    router.push(buildURL(toaster, currentRound, nextRound));
    setMutex(false);
  };

  return (
    <Card
      data={{
        hackathon: hackathon,
        organization: hackathon.organization,
        isExplore: false,
      }}
      onClick={handleClick}
    />
  );
};

export default EventCard;
