import Navbar from '@/components/common/navbar';
import Head from 'next/head';
import React, { ReactNode } from 'react';

interface WrapperProps {
  title?: string;
  children: ReactNode;
}

const BaseWrapper: React.FC<WrapperProps> = ({ children, title = '' }) => {
  return (
    <>
      <Head>
        <title>{title}Hackathons | Interact</title>
      </Head>
      <Navbar />
      <div className="w-full flex pt-navbar bg-gradient relative overflow-x-clip">
        <div className="w-screen h-full bg-base absolute top-0 left-0 opacity-60" />
        <div className="w-full h-full z-10">{children}</div>
      </div>
    </>
  );
};

export default BaseWrapper;
