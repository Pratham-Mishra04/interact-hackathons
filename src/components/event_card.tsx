import React, { useState } from 'react';
import { Event, Hackathon, HackathonRound } from '@/types';
import Image from 'next/image';
import { EVENT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
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

interface Props {
  event: Event;
}

const getDurationInHours = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60); // Convert milliseconds to hours
  return `${Math.ceil(durationHours)} hours`;
};

const EventCard = ({ event }: Props) => {
  const startDate = event.hackathon?.startTime ? new Date(event.hackathon.startTime) : null;
  const formattedMonth = startDate ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate) : 'N/A';
  const formattedDay = startDate ? startDate.getDate() : 'N/A';

  const getPrizeAmount = () => {
    if (event.hackathon && event.hackathon.prizes) {
      return (
        '₹' +
        formatPrice(
          event.hackathon.prizes.reduce((acc, prize) => {
            acc = acc + prize.amount;
            return acc;
          }, 0)
        )
      );
    }
    return 'N/A';
  };

  const getTeamSize = () => {
    if (event.hackathon) {
      return `${event.hackathon.minTeamSize || 'N/A'}-${event.hackathon.maxTeamSize || 'N/A'}`;
    }
    return 'N/A';
  };

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-dark_primary_comp_hover rounded-3xl p-4 hover:shadow-xl transition-ease-300 m-2">
      <div className="relative">
        <Image
          width={400}
          height={200}
          src={`${EVENT_PIC_URL}/${event?.coverPic}`}
          alt="Event Pic"
          className="w-full h-48 rounded-2xl overflow-hidden mb-4"
        />
        <div className="absolute bottom-[-10px] -left-4">
          <UserHoverCard
            trigger={
              <div className="bg-white dark:bg-dark_primary_comp_hover  rounded-full p-3">
                <div className={`relative w-12 h-12 rounded-full flex flex-col items-center justify-center`}>
                  <Image
                    crossOrigin="anonymous"
                    width={100}
                    height={100}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${event.organization.user.profilePic}`}
                    className="w-10 h-10 rounded-full mt-1"
                  />
                </div>
              </div>
            }
            user={event.organization.user}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold line-clamp-1">{event.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{event.tagline}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <LowerCardItem
            title={event.hackathonID ? 'Prize' : 'Duration'}
            content={event.hackathonID ? getPrizeAmount() : getDurationInHours(event.startTime, event.endTime)}
          />
          <LowerCardItem title={event.hackathonID ? 'Team' : 'Location'} content={event.hackathonID ? getTeamSize() : event.location} />
          <LowerCardItem title="Date" content={`${formattedDay} ${formattedMonth}`} />
        </div>
      </div>
    </div>
  );
};

const LowerCardItem = ({ title, content }: { title: string; content: string }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-gray-500 font-medium dark:text-gray-300">{title}</p>
      <p className="text-center">{content}</p>
    </div>
  );
};

export const HackathonCard = ({ hackathon, isAdmin }: { hackathon: Hackathon; isAdmin?: boolean }) => {
  const [mutex, setMutex] = useState(false);

  const router = useRouter();

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      return [res.data.round, res.data.nextRound];
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const buildURL = (toasterID: Id, currentRound: HackathonRound, nextRound: HackathonRound) => {
    let URL = '';
    if (isAdmin) URL += 'admin';
    else URL += 'participant';
    switch (getHackathonStage(hackathon, true, currentRound, nextRound)) {
      case HACKATHON_NOT_STARTED:
        URL = '#';
        Toaster.stopLoad(toasterID, "Hackathon hasn't started.", 0);
        break;
      case HACKATHON_TEAM_REGISTRATION:
        if (isAdmin) URL += '/teams';
        else URL += '/team';
        break;
      case HACKATHON_TEAM_ENDED:
        URL += `/stage`;
        break;
      case HACKATHON_LIVE:
        URL += `/live`;
        break;
      case HACKATHON_COMPLETED:
        URL += `/ended`;
        break;
    }

    Toaster.stopLoad(toasterID, 'Hackathon loaded! Redirecting to dashboard...', 1);
    return URL;
  };

  const dispatch = useDispatch();

  const handleClick = async () => {
    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Fetching Hackathon details...');

    dispatch(setCurrentHackathon(hackathon));
    const [currentRound, nextRound] = (await getCurrentRound()) || [undefined, undefined];
    router.push(buildURL(toaster, currentRound, nextRound));
    setMutex(false);
  };

  const startDate = hackathon.startTime ? new Date(hackathon.startTime) : null;
  const formattedMonth = startDate ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate) : 'N/A';
  const formattedDay = startDate ? startDate.getDate() : 'N/A';

  const getPrizeAmount = () => {
    if (hackathon.prizes) {
      return String(hackathon.prizes[0].amount);
    }
    return 'N/A';
  };

  const getTeamSize = () => {
    return `${hackathon.minTeamSize || 'N/A'}-${hackathon.maxTeamSize || 'N/A'}`;
  };

  return (
    <div
      className="relative w-full max-w-md bg-white dark:bg-dark_primary_comp_hover rounded-3xl p-4 hover:shadow-xl transition-ease-300 m-2 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <Image
          width={400}
          height={200}
          src={`${EVENT_PIC_URL}/${hackathon.coverPic}`}
          alt="Event Pic"
          className="w-full rounded-2xl mb-4"
          placeholder="blur"
          blurDataURL={hackathon.blurHash || EVENT_PIC_HASH_DEFAULT}
        />
        <div className="absolute bottom-[-10px] -left-4">
          <UserHoverCard
            trigger={
              <div className="bg-white dark:bg-dark_primary_comp_hover  rounded-full p-3">
                <div className={`relative w-12 h-12 rounded-full flex flex-col items-center justify-center`}>
                  <Image
                    crossOrigin="anonymous"
                    width={100}
                    height={100}
                    alt={'User Pic'}
                    src={`${USER_PROFILE_PIC_URL}/${hackathon.organization.user.profilePic}`}
                    className="w-10 h-10 rounded-full mt-1"
                  />
                </div>
              </div>
            }
            user={hackathon.organization.user}
          />
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold line-clamp-1">{hackathon.title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{hackathon.tagline}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <LowerCardItem
            title={hackathon.prizes[0]?.amount ? 'Prize' : 'Duration'}
            content={hackathon.prizes[0]?.amount ? getPrizeAmount() : getDurationInHours(hackathon.startTime, hackathon.endTime)}
          />
          <LowerCardItem title={'Team'} content={getTeamSize()} />
          <LowerCardItem title="Date" content={`${formattedDay} ${formattedMonth}`} />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
