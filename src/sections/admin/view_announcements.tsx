import React, { useEffect, useMemo, useState } from 'react';
import { Announcement } from '@/types';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import AnnouncementCard from '@/components/announcement_card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { userSelector } from '@/slices/userSlice';

const ViewAnnouncements = ({
  triggerReload,
  trigger,
  triggerClass,
}: {
  triggerReload: boolean;
  trigger?: React.ReactNode;
  triggerClass?: string;
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

  const user = useSelector(userSelector);

  const isOrgUser = useMemo(
    () => user.organizationMemberships?.map(m => m.organizationID).includes(hackathon.organizationID),
    [user.organizationMemberships, hackathon.organizationID]
  );

  return (
    <Sheet>
      <SheetTrigger className={`w-1/2 max-md:w-full h-full ${triggerClass}`}>
        {trigger || <Button className="w-full button-gradient">View All Announcements</Button>}
      </SheetTrigger>
      <SheetContent className="w-[400px] space-y-6">
        <SheetHeader>
          <SheetTitle>Announcements</SheetTitle>
          <SheetDescription>List of all the announcements which are now shown to the participants </SheetDescription>
        </SheetHeader>
        {announcements && announcements.length > 0 ? (
          <div className="w-full space-y-4">
            {announcements.map(announcement => (
              <AnnouncementCard key={announcement.id} announcement={announcement} setAnnouncements={setAnnouncements} isAdmin={isOrgUser} />
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
