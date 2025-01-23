import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export interface AppSidebarProps {
  hackathonName: string;
  hackathonTagline: string;
  tracks: number;
  participants: number;
  totalRemaining: number;
  handleEndHackathon: () => Promise<void>;
}

export const AppSidebar = ({ hackathonName, hackathonTagline, tracks, participants, totalRemaining, handleEndHackathon }: AppSidebarProps) => {
  const router = useRouter();

  return (
    <div className={'h-base w-1/6 max-md:w-full md:bg-white max-md:mt-16'}>
      <div className={'flex flex-col justify-between md:h-base'}>
        <div className={'h-full px-5 max-md:hidden'}>
          <div className={'pt-5 py-2.5 space-y-2'}>
            <div className={'text-3xl text-wrap font-bold gradient-text-3 font-primary max-md:text-2xl'}>{hackathonName}</div>
            <div className={'text-black text-sm mt-2 font-primary max-md:text-sm'}>{hackathonTagline}</div>
          </div>
          <div className={'py-5 space-y-1 font-primary font-bold text-black border-b-2 border-neutral-300'}>
            <div>
              <span className={'gradient-text-3 text-lg max-md:text-base'}>Tracks: </span>
              {tracks}
            </div>
            <div>
              <span className={'gradient-text-3 text-lg max-md:text-base'}>Participants: </span>
              {participants}
            </div>
            <div>
              <span className={'gradient-text-3 text-lg max-md:text-base'}>Total Remaining: </span>
              {totalRemaining}
            </div>
          </div>
        </div>

        <div className={'space-y-2 mb-2 px-4'}>
          <Dialog>
            <DialogTrigger className="w-full">
              <Button className="w-full max-md:text-xs" variant="destructive">
                End Hackathon
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="text-left">
                <DialogTitle>End Hackathon</DialogTitle>
                <DialogDescription>
                  This action can not be undone. This will mark this hackathon as ended, no further actions would be possible.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={handleEndHackathon} variant={'destructive'}>
                Confirm
              </Button>
            </DialogContent>
          </Dialog>
          <Button
            className={'flex gap-2 justify-between items-center w-full text-white bg-neutral-700 hover:bg-neutral-600'}
            onClick={() => router.back()}
          >
            <Undo2 className={'size-5'} />
            <div className={'w-full text-wrap max-md:text-xs line-clamp-1'}>Return to Dashboard</div>
          </Button>
        </div>
      </div>
    </div>
  );
};
