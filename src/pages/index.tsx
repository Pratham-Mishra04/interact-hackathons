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
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { EXPLORE_URL, FRONTEND_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { FlagIcon, GraduationCapIcon, MapPinIcon } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import Link from 'next/link';
import { HackathonCard } from '@/components/event_card';
import { initialUser } from '@/types/initials';
import { motion } from 'motion/react';
import FadeIn from '@/components/animation/fade-in';
import UserCard from '@/components/common/user_card';
import Loader from '@/components/common/loader';

interface LiveCard {
  text: string;
  linkText: string;
  href: string;
}

enum HackathonType {
  REGISTERED = 'Registered Hackathons',
  ADMIN = 'Admin Hackathons',
  ORG = 'Organisation Hackathons',
  DEFAULT = '',
}

const Index = () => {
  const [registeredHackathons, setRegisteredHackathons] = useState<Hackathon[]>([]);
  const [adminHackathons, setAdminHackathons] = useState<Hackathon[]>([]);
  const [orgHackathons, setOrgHackathons] = useState<Hackathon[]>([]);
  const [hackathonFilter, setHackathonFilter] = useState<HackathonType>(HackathonType.DEFAULT);
  const [userProfile, setUserProfile] = useState<User>(initialUser);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHackathons = async (URL: string, setter: React.Dispatch<React.SetStateAction<Hackathon[]>>) => {
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode == 200) {
      setter(res.data.hackathons || []);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const fetchUserProfile = async () => {
    const res = await getHandler('/users/me', undefined, true);
    if (res.statusCode == 200) {
      setUserProfile(res.data.user);
      setLoading(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

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
      if (registeredHackathons.length > 0) setHackathonFilter(HackathonType.REGISTERED);
      else if (adminHackathons.length > 0) setHackathonFilter(HackathonType.ADMIN);
      else if (orgHackathons.length > 0) setHackathonFilter(HackathonType.ORG);
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

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleLogout() {
    Cookies.remove('token');
    Cookies.remove('refresh_token');
    Cookies.remove('id');
    window.location.replace('/login');
  }

  const fetchUsers = () => {
    const URL = `${EXPLORE_URL}/users?order=trending&limit=5`;
    getHandler(URL, undefined, true)
      .then(res => {
        if (res.statusCode === 200) {
          const profileData: User[] = res.data.users || [];
          setUsers(profileData.filter(u => u.id != user.id));
        } else {
          if (res.data.message) Toaster.error(res.data.message, 'error_toaster');
          else {
            Toaster.error(SERVER_ERROR, 'error_toaster');
          }
        }
      })
      .catch(err => {
        Toaster.error(SERVER_ERROR, 'error_toaster');
      });
  };

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

        <div className={'w-full mx-auto flex max-lg:flex-col max-lg:gap-4 gap-10 mt-5 px-14 max-md:px-7'}>
          <div className={'w-3/5 max-lg:w-full'}>
            {loading ? (
              <Loader />
            ) : (
              <FadeIn initialScale={1}>
                <UserInfo user={userProfile} />
              </FadeIn>
            )}
          </div>
          <div className={'w-2/5 max-lg:w-full'}>
            <LiveOnInteract cards={dummyLiveCards} />
          </div>
        </div>

        <div className={'w-full flex max-lg:flex-col gap-4 mt-5 px-14 max-md:px-7 pb-4'}>
          <div className={'w-3/4 max-lg:w-full space-y-2 bg-white/40 p-2 rounded-xl'}>
            <FadeIn initialScale={1}>
              <div className={'flex gap-2'}>
                {registeredHackathons.length > 0 && (
                  <HackathonFilterItem currentFilter={hackathonFilter} setFilter={setHackathonFilter} value={HackathonType.REGISTERED} />
                )}
                {adminHackathons.length > 0 && (
                  <HackathonFilterItem currentFilter={hackathonFilter} setFilter={setHackathonFilter} value={HackathonType.ADMIN} />
                )}
                {orgHackathons.length > 0 && (
                  <HackathonFilterItem currentFilter={hackathonFilter} setFilter={setHackathonFilter} value={HackathonType.ORG} />
                )}
              </div>
            </FadeIn>
            <div className={'w-full flex rounded-xl p-2'}>
              <div className={'grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6'}>
                {hackathonFilter == HackathonType.REGISTERED &&
                  registeredHackathons.length > 0 &&
                  registeredHackathons.map(hackathon => (
                    <FadeIn key={hackathon.id} className={'max-w-80 max-lg:max-w-72'}>
                      <HackathonCard hackathon={hackathon} />
                    </FadeIn>
                  ))}
                {hackathonFilter == HackathonType.ADMIN &&
                  adminHackathons.length > 0 &&
                  adminHackathons.map(hackathon => (
                    <FadeIn key={hackathon.id} className={'max-w-80 max-lg:max-w-72'}>
                      <HackathonCard hackathon={hackathon} isAdmin />
                    </FadeIn>
                  ))}
                {hackathonFilter == HackathonType.ORG &&
                  orgHackathons.length > 0 &&
                  orgHackathons.map(hackathon => (
                    <FadeIn key={hackathon.id} className={'max-w-80 max-lg:max-w-72'}>
                      <HackathonCard hackathon={hackathon} isAdmin />
                    </FadeIn>
                  ))}
              </div>
            </div>
          </div>
          <FadeIn initialScale={1} className="w-1/4 max-lg:w-full">
            {users && users.length > 0 && (
              <div className="w-full flex flex-col gap-2 bg-white dark:bg-dark_primary_comp rounded-lg p-4 transition-ease-300 animate-fade_half sticky top-24 max-h-base overflow-y-auto">
                <div className="w-fit text-2xl font-bold blue-text-gradient">Profiles to Follow</div>
                <div className="w-full flex flex-col gap-2">
                  {users?.map(user => (
                    <UserCard key={user.id} user={user} forTrending />
                  ))}
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </BaseWrapper>
  );
};

const HackathonFilterItem = ({
  currentFilter,
  setFilter,
  value,
  className,
}: {
  currentFilter: HackathonType;
  setFilter: React.Dispatch<React.SetStateAction<HackathonType>>;
  value: HackathonType;
  className?: string;
}) => {
  return (
    <div
      onClick={() => setFilter(value)}
      className={`p-2 px-3 max-md:text-sm rounded-lg cursor-pointer shadow-sm transition-all duration-300 ${
        currentFilter === value ? 'bg-sky-400 text-white shadow-none font-medium' : 'bg-white'
      } ${className}`}
    >
      {value}
    </div>
  );
};

const Tag = ({ icon, text }: { icon?: React.ReactNode; text: string }) => {
  return (
    <span className={'flex justify-between items-center px-3.5 py-0.5 text-sm gap-2 max-md:gap-1 border border-dotted border-neutral-600 rounded-full max-md:text-sm'}>
      {icon}
      <span>{text}</span>
    </span>
  );
};

//TODO: Links to be added
const dummyLiveCards: LiveCard[] = [
  { text: '550+', linkText: 'Projects', href: '/' },
  { text: '2.5k', linkText: 'Active Users', href: '/' },
  { text: '10+', linkText: 'Hackathons', href: '/' },
];

const LiveCard = ({ card }: { card: LiveCard }) => {
  return (
    <div
      className={'size-[11rem] max-sm:size-[8rem] rounded-xl text-white shadow-xl flex justify-center items-center'}
      style={{
        // background: rgb(5,17,88);
        background: 'radial-gradient(circle, rgba(57,141,247,1) 0%, rgba(27,66,204,1) 100%)',
      }}
    >
      <div className={'flex flex-col justify-center gap-2'}>
        <div className={'text-center text-2xl max-sm:text-lg font-bold'}>{card.text}</div>
        <Link className={'border border-white rounded-full p-2 px-3 max-sm:py-1.5 max-sm:px-2 flex items-center gap-1.5'} href={card.href}>
          <FlagIcon fill={'white'} className={'size-3.5 mt-0.5'} />
          <p className={'text-sm max-sm:text-xs'}>{card.linkText}</p>
        </Link>
      </div>
    </div>
  );
};

const LiveOnInteract = ({ cards }: { cards: LiveCard[] }) => {
  return (
    <div
      className={'w-full h-full py-4 rounded-xl flex flex-col justify-center gap-2'}
      style={{
        background: 'radial-gradient(circle, rgba(25,78,145,1) 0%, rgba(13,19,43,1) 100%)',
      }}
    >
      <div className={'w-fit mx-auto text-2xl max-md:text-xl font-semibold text-white'}>Live on Interact!</div>
      <div className="w-full">
        <Swiper
          modules={[EffectCoverflow]}
          effect={'coverflow'}
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
          className={'max-w-lg max-sm:max-w-sm'}
        >
          {cards.map((card, index) => (
            <SwiperSlide key={card.text}>
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
              >
                <LiveCard card={card} />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

const UserInfo = ({ user }: { user: User }) => {
  return (
    <div className={'w-full h-full bg-white flex flex-col gap-4 p-4 rounded-xl'}>
      <div className={'flex w-full gap-10 justify-between max-lg:flex-col max-lg:gap-2'}>
        <div className={'flex max-sm:flex-col gap-6 w-full lg:w-1/2 justify-around'}>
          <Image
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic}`}
            alt={'user-profile-pic'}
            width={152}
            height={152}
            className={'w-32 h-32 max-md:h-16 max-md:w-16 rounded-full'}
          />
          <div className={'w-full flex flex-col gap-2 justify-between'}>
            <div>
              <div className={'text-2xl font-bold max-md:xl'}>{user.name}</div>
              <div className={'text-lg max-md:text-base'}>{user.tagline}</div>
            </div>
            <Link href={`${FRONTEND_URL}/users/${user.username}`} target="_blank">
              <Button variant={'outline'}>Edit Profile</Button>
            </Link>
          </div>
        </div>
        <div className={'border border-neutral-600 border-dotted p-2 rounded-xl w-full min-h-32 lg:w-1/2 text-wrap shrink'}>
          {user.bio}
          {!user.bio && <span className={'text-neutral-500'}>You haven&apos;t added your bio yet.</span>}
        </div>
      </div>
      <div className={'border border-neutral-600 border-dotted shadow-sm rounded-xl flex flex-wrap p-2 gap-2'}>
        {user.profile.school !== '' && <Tag icon={<GraduationCapIcon className={'size-5 max-md:size-4'} strokeWidth={1.5} />} text={user.profile.school} />}
        {user.profile.location !== '' && <Tag icon={<MapPinIcon className={'size-4 max-md:size-3'} strokeWidth={1.5} />} text={user.profile.location} />}
        {user.tags.map(tag => (
          <Tag text={tag} key={tag} />
        ))}
      </div>
    </div>
  );
};

export default Protect(Index);
