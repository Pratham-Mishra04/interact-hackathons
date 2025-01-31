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

const Navbar = () => {
  const user = useSelector(userSelector);
  const [clickedOnProfile, setClickedOnProfile] = useState(false);
  const hackathon = useSelector(currentHackathonSelector);

  const path = window.location.pathname?.replace('/', '');

  return (
    <div className="w-full h-navbar bg-navbar dark:bg-dark_navbar text-gray-500 dark:text-white border-gray-300 border-b-[1px] dark:border-0 glassMorphism backdrop-blur-sm fixed top-0 flex justify-between px-4 items-center z-20">
      {clickedOnProfile && <ProfileDropdown setShow={setClickedOnProfile} />}
      <Link href={'/'} className="hidden dark:flex dark:flex-row">
        <ReactSVG src="/onboarding_logo_dark.svg" />
        {hackathon && <span className="text-black dark:text-white font-medium">X {hackathon.organizationTitle}</span>}
      </Link>
      <Link href={'/'} className="static dark:hidden flex flex-row">
        <ReactSVG src="/onboarding_logo.svg" className="scale-75 md:scale-100 relative -left-4 md:left-0" />
        {hackathon && path && (
          <span className="h-full text-black dark:text-white flex-center gap-5 font-bold mt-[0.4rem]">
            <div>X</div>
            <div>{hackathon.organizationTitle}</div>
          </span>
        )}
      </Link>

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
