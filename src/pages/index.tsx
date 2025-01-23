import { Button } from '@/components/ui/button';
import { SERVER_ERROR } from '@/config/errors';
import getHandler from '@/handlers/get_handler';
import useUserStateSynchronizer from '@/hooks/sync';
import { userSelector } from '@/slices/userSlice';
import { Hackathon, User } from '@/types';
import Toaster from '@/utils/toaster';
import Protect from '@/utils/wrappers/protect';
import BaseWrapper from '@/wrappers/base';
import { SignOut } from '@phosphor-icons/react';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useRef, useState, Dispatch } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { FlagIcon, GraduationCapIcon, MapPinIcon } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import "swiper/css"
import "swiper/css/effect-coverflow"
import Link from 'next/link';
import { HackathonCard } from '@/components/event_card';
import { initialUser } from '@/types/initials';

interface LiveCard {
  text: string,
  linkText: string,
  href: string,
}

enum HackathonType {
  REGISTERED ="Registered Hackathons",
  ADMIN = "Admin Hackathons",
  ORG = "Organisation Hackathons",
  DEFAULT = "",
}


const Index = () => {
  const [registeredHackathons, setRegisteredHackathons] = useState<Hackathon[]>([]);
  const [adminHackathons, setAdminHackathons] = useState<Hackathon[]>([]);
  const [orgHackathons, setOrgHackathons] = useState<Hackathon[]>([]);
  const [hackathonFilter, setHackathonFilter] = useState<HackathonType>(HackathonType.DEFAULT);
  const [userProfile, setUserProfile] = useState<User>(initialUser);

  const fetchHackathons = async (URL: string, setter: React.Dispatch<React.SetStateAction<Hackathon[]>>) => {
    const res = await getHandler(URL);
    if (res.statusCode == 200) {
      setter(res.data.hackathons || []);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const fetchUserProfile = async ()=>{
    const res = await getHandler("/users/me");
    if (res.statusCode == 200) {
      setUserProfile(res.data.user);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  }

  const userStateSynchronizer = useUserStateSynchronizer();

  const user = useSelector(userSelector);

  useEffect(() => {
    fetchHackathons('/hackathons/me', setRegisteredHackathons);
    fetchHackathons('/hackathons/admin/me', setAdminHackathons);
    fetchHackathons('/hackathons/org/me', setOrgHackathons);
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (hackathonFilter == HackathonType.DEFAULT) {
      if (registeredHackathons.length > 0) setHackathonFilter(HackathonType.REGISTERED)
      else if (adminHackathons.length > 0) setHackathonFilter(HackathonType.ADMIN)
      else if (orgHackathons.length > 0) setHackathonFilter(HackathonType.ORG)
      else setHackathonFilter(HackathonType.DEFAULT);
    }
  }, [registeredHackathons, adminHackathons, orgHackathons]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action == 'sync') userStateSynchronizer(); //TODO remove form params after promise is successful
    else {
      if (user.registeredEvents?.length == 0 && user.organizationMemberships?.length == 0) userStateSynchronizer();
    }
  }, [window.location.search]);

  function handleLogout() {
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('id');
    window.location.replace('/login');
  }
  return (
    <BaseWrapper>
      <div className="w-full bg-[#E1F1FF] min-h-base h-full">
        <div className="w-full bg-white h-fit py-2 text-primary_text flex items-center  justify-between px-4">
          <span className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold">Hackathon Dashboard</h1>
            <p className="text-xs text-black/60">Manage all your hackathons from here</p>
          </span>
          <Button className="px-4 md:px-8 gap-3" variant={'outline'} onClick={handleLogout}>
            <p className="hidden md:inline-block">Logout</p>
            <SignOut size={16} />
          </Button>
        </div>

        <div className={"w-full mx-auto flex max-lg:flex-col max-lg:gap-4 gap-10 px-14 max-md:px-7 mt-5"}>
          <div className={"w-full"}>
            <UserInfo user={userProfile} />
          </div>
          <div className={"w-2/5 max-lg:w-full"}>
            <LiveOnInteract cards={dummyLiveCards} />
          </div>
        </div>

        <div className={"w-full mx-auto flex max-lg:flex-col max-lg:gap-4 gap-10 px-14 max-md:px-7 mt-5 overflow-hidden"}>
          <div className={"flex flex-col gap-2 w-full"}>
            <div className={"flex gap-2"}>
              {registeredHackathons.length > 0 && <HackathonFilterItem
                currentFilter={hackathonFilter}
                setFilter={setHackathonFilter}
                value={HackathonType.REGISTERED}
              />}
              {adminHackathons.length > 0 && <HackathonFilterItem
                currentFilter={hackathonFilter}
                setFilter={setHackathonFilter}
                value={HackathonType.ADMIN}
              />}
              {orgHackathons.length > 0 && <HackathonFilterItem
                currentFilter={hackathonFilter}
                setFilter={setHackathonFilter}
                value={HackathonType.ORG}
              />}
            </div>
            <div className={"w-full h-[30rem] overflow-y-auto overflow-x-hidden pr-5 flex justify-start rounded-xl"}>
              <div className={"grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-6"}>
                {hackathonFilter == HackathonType.REGISTERED && registeredHackathons.length > 0 && (
                  registeredHackathons.map(hackathon => (
                    <div className={"max-w-80"} key={hackathon.id}><HackathonCard hackathon={hackathon} /></div>
                  ))
                )}
                {hackathonFilter == HackathonType.ADMIN && adminHackathons.length > 0 && (
                  adminHackathons.map(hackathon => (
                    <div className={"max-w-80"} key={hackathon.id}><HackathonCard hackathon={hackathon} /></div>
                  ))
                )}
                {hackathonFilter == HackathonType.ORG && orgHackathons.length > 0 && (
                  orgHackathons.map(hackathon => (
                    <div className={"max-w-80"} key={hackathon.id}><HackathonCard hackathon={hackathon} /></div>
                  ))
                )}
              </div>
            </div>
            <div>

            </div>
          </div>
          <div>
            {/*{People to follow}*/}
          </div>
        </div>

        {/*<div className="w-full md:w-[95%] mx-auto h-full flex flex-col gap-8 py-8">*/}
        {/*  <div className="w-full flex flex-col gap-8 p-4">*/}
        {/*    {registeredHackathons && registeredHackathons.length > 0 && (*/}
        {/*      <div className="w-full flex flex-col">*/}
        {/*        <div className="text-lg md:text-xl px-4 py-1 rounded-t-xl font-medium bg-white text-primary_text w-fit">Registered Hackathons</div>*/}
        {/*        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-3 rounded-xl rounded-tl-none">*/}
        {/*          {registeredHackathons.map(hackathon => (*/}
        {/*            <HackathonCard key={hackathon.id} hackathon={hackathon} />*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*    {adminHackathons && adminHackathons.length > 0 && (*/}
        {/*      <div className="w-full flex flex-col">*/}
        {/*        <div className="text-lg md:text-xl px-4 py-1 rounded-t-xl font-medium bg-white text-primary_text w-fit">Admin Hackathons</div>*/}
        {/*        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-3 rounded-xl rounded-tl-none">*/}
        {/*          {adminHackathons.map(hackathon => (*/}
        {/*            <HackathonCard key={hackathon.id} hackathon={hackathon} isAdmin={true} />*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*    {orgHackathons && orgHackathons.length > 0 && (*/}
        {/*      <div className="w-full flex flex-col">*/}
        {/*        <div className="text-lg md:text-xl px-4 py-1 rounded-t-xl font-medium bg-white text-primary_text w-fit">Org Hackathons</div>*/}
        {/*        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-3 rounded-xl rounded-tl-none">*/}
        {/*          {orgHackathons.map(hackathon => (*/}
        {/*            <HackathonCard key={hackathon.id} hackathon={hackathon} isAdmin={true} />*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </BaseWrapper>
  );
};

const HackathonFilterItem = ({
  currentFilter,
  setFilter,
  value,
  className
}:{
  currentFilter: HackathonType,
  setFilter: React.Dispatch<React.SetStateAction<HackathonType>>,
  value: HackathonType
  className?: string,
})=>{
  return (
    <div
      onClick={() => setFilter(value)}
      className={`p-2 px-3 rounded-lg cursor-pointer shadow-sm transition-all duration-300 ${
        currentFilter === value 
          ? "bg-sky-400 text-white shadow-none font-medium"
          : "bg-white"
      } ${className}`}
    >
      {value}
    </div>
  )
}

const Tag = ({
               icon,
               text
             }: {
  icon?: React.ReactNode,
  text: string
}) => {
  return (
    <span
      className={'flex justify-between items-center px-3.5 py-0.5 text-sm gap-2 border border-dotted border-neutral-600 rounded-full'}>
      {icon}
      <span>{text}</span>
    </span>
  )
}

const dummyLiveCards: LiveCard[] = [
  { text: "550+", linkText: "Projects", href: "/" },
  { text: "2.5k", linkText: "Active Users", href: "/" },
  { text: "10+", linkText: "Hackathons", href: "/" },
]

const LiveCard = ({
  card
}: {
  card: LiveCard
})=>{
  return (
    <div className={"size-[11rem] rounded-xl text-white shadow-xl flex justify-center items-center"} style={{
      // background: rgb(5,17,88);
      background: "radial-gradient(circle, rgba(57,141,247,1) 0%, rgba(27,66,204,1) 100%)",
    }}>
      <div className={"flex flex-col justify-center gap-2"}>
        <div className={"text-center text-2xl font-bold"}>{card.text}</div>
        <Link className={"border border-white rounded-full p-2 px-3 flex items-center gap-1.5"} href={card.href}>
          <FlagIcon fill={"white"} className={"size-3.5 mt-0.5"} />
          <p className={"text-sm"}>{card.linkText}</p>
        </Link>
      </div>
    </div>
  )
}

const LiveOnInteract = ({
  cards
}: {
  cards: LiveCard[]
})=>{

  return (
    <div className={"w-full h-full p-2 pb-5 rounded-xl"} style={{
      background: "radial-gradient(circle, rgba(25,78,145,1) 0%, rgba(13,19,43,1) 100%)",
    }}>
    <div className={"text-white"}>Live on Interact</div>
      <Swiper
        modules={[EffectCoverflow]}
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        initialSlide={1}
        coverflowEffect={{
          rotate: 20,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: true,
        }}
        className={"max-w-[30rem]"}
      >
        {cards.map(card => (
          <SwiperSlide key={card.text}>
            <LiveCard card={card} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

const UserInfo = ({
  user
}: {
  user: User
}) => {
  return (
    <div className={"w-full bg-white flex flex-col gap-2 p-4 rounded-xl"}>
      <div className={"flex w-full gap-10 justify-between max-lg:flex-col max-lg:gap-2"}>
        <div className={"flex gap-6 w-full lg:w-1/2 justify-around"}>
          <Image
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            alt={"user-profile-pic"}
            width={152}
            height={152}
            className={"w-40 h-40 rounded-xl"}
          />
          <div className={"w-full"}>
            <div className={"text-2xl font-bold"}>{user.name}</div>
            <div className={"text-lg"}>{user.tagline}</div>
          </div>
        </div>
        <div className={"border border-neutral-600 border-dotted p-2 rounded-xl w-full min-h-32 lg:w-1/2 text-wrap shrink"}>
          {user.bio}
          {!user.bio && <span className={"text-neutral-500"}>Your bio</span>}
        </div>
      </div>
      <div className={"border border-neutral-600 border-dotted shadow-sm rounded-xl flex flex-wrap p-2 gap-2"}>
        {user.profile.school !== "" && <Tag icon={<GraduationCapIcon className={"size-5"} strokeWidth={1.5} />} text={user.profile.school} />}
        {user.profile.location !== "" && <Tag icon={<MapPinIcon className={'size-4'} strokeWidth={1.5} />} text={user.profile.location} />}
        {user.tags.map(tag => (
          <Tag text={tag} key={tag} />
        ))}
      </div>
    </div>
  )
}

export default Protect(Index);
