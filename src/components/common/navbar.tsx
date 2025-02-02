import { Bell, ChatCircleDots, Handshake, MagnifyingGlass } from '@phosphor-icons/react';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ReactSVG } from 'react-svg';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { userSelector } from '@/slices/userSlice';
import ProfileDropdown from '@/sections/navbar/profile_dropdown';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import Link from 'next/link';
import FadeIn from "@/components/animation/fade-in";

const Navbar = () => {
  const user = useSelector(userSelector);
  const [clickedOnProfile, setClickedOnProfile] = useState(false);
  const hackathon = useSelector(currentHackathonSelector);

  const path = window.location.pathname?.replace('/', '');

  return (
    <div className="w-full h-navbar bg-navbar dark:bg-dark_navbar text-gray-500 dark:text-white border-gray-300 border-b-[1px] dark:border-0 glassMorphism backdrop-blur-sm fixed top-0 flex justify-between px-4 items-center z-20">
      {clickedOnProfile && <ProfileDropdown setShow={setClickedOnProfile} />}
      {/*<Link href={'/'} className="hidden dark:flex dark:flex-row">*/}
      {/*  /!*<ReactSVG src="/onboarding_logo_dark.svg" />*!/*/}
      {/*    <Image src={"/logo.png"} alt={"interact"} height={160} width={160} />*/}
      {/*  {hackathon && <span className="text-black dark:text-white font-medium">X {hackathon.organizationTitle}</span>}*/}
      {/*</Link>*/}
    <FadeIn duration={0.2} initialScale={1} initialOpacity={0.5}>
      <Link href={'/'} className="static dark:hidden flex flex-row gap-3.5 items-center">
        {/*<ReactSVG src="/onboarding_logo.svg" className="scale-75 md:scale-100 relative -left-4 md:left-0" />*/}
          <Image src={"/logo.png"} alt={"interact"} height={160} width={160} className={"size-9"} />
        {/*{hackathon && path && (*/}
          <span className="h-full text-black dark:text-white flex-center gap-3.5 font-bold">
            <div className={"italic text-lg"}>X</div>
            <Image src={"/yantra.png"} alt={"yantra"} width={1422} height={420} className={"h-10 w-32"} />
          </span>
        {/*)}*/}
      </Link>
    </FadeIn>

      {user.id && (
        <div className="flex items-center gap-2 max-md:gap-0 z-0">
          <span className="text-black font-medium">{user.username}</span>
          <Image
            crossOrigin="anonymous"
            className="w-9 h-9 max-md:w-6 max-md:h-6 max-md:ml-2 rounded-full"
            width={50}
            height={50}
            alt="user"
            src={`${USER_PROFILE_PIC_URL}/${user.profilePic != '' ? user.profilePic : 'default.jpg'}`}
          />
        </div>
      )}
    </div>
  );
};

export default Navbar;
