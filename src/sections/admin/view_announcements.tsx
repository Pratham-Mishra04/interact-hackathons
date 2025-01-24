import React, { useEffect, useState } from 'react';
import { Announcement } from '@/types';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import AnnouncementCard from '@/components/announcement_card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const ViewAnnouncements = ({
 triggerReload, trigger, triggerClass
}: {
  triggerReload: boolean,
  trigger?: React.ReactNode,
  triggerClass?: string,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const hackathon = useSelector(currentHackathonSelector);

  const fetchAnnouncements = async () => {
    const res = await getHandler(`/org/${hackathon.organizationID}/hackathons/${hackathon.id}/announcements/`);
    if (res.statusCode == 200) {
      setAnnouncements(res.data.announcements);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [triggerReload]);

  return (
    <Sheet>
      <SheetTrigger className={`w-1/2 h-full ${triggerClass}`}>
        {trigger || <Button className="w-full button-gradient">View All Announcements</Button> }
      </SheetTrigger>
      <SheetContent className="w-[400px] space-y-6">
        <SheetHeader>
          <SheetTitle>Announcements</SheetTitle>
          <SheetDescription>List of all the announcements which are not shown to the participants </SheetDescription>
        </SheetHeader>
        {announcements && announcements.length > 0 ? (
          <div className="w-full space-y-4">
            {announcements.map(announcement => (
              <AnnouncementCard key={announcement.id} announcement={announcement} setAnnouncements={setAnnouncements} isAdmin />
            ))}
          </div>
        ) : (
          <div className="text-center font-medium">No Announcements yet.</div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ViewAnnouncements;
