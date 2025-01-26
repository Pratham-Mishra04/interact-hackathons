import { SERVER_ERROR } from '@/config/errors';
import { ORG_URL } from '@/config/routes';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Announcement } from '@/types';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Editor from '@/components/editor';
import { Button } from '@/components/ui/button';
import socketService from '@/config/ws';
import { initialAnnouncement } from '@/types/initials';

const NewAnnouncement = ({
  setTriggerReload,
  triggerClass,
}: {
  setTriggerReload: React.Dispatch<React.SetStateAction<boolean>>;
  triggerClass?: string;
}) => {
  const [content, setContent] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hackathon = useSelector(currentHackathonSelector);

  const handleSubmit = async () => {
    if (content.trim() == '' || content.replace(/\n/g, '').length == 0) {
      Toaster.error('Caption cannot be empty!');
      return;
    }

    const toaster = Toaster.startLoad('Adding your Announcement..');

    const formData = {
      title: '',
      content,
    };

    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/announcements`;

    const res = await postHandler(URL, formData);
    if (res.statusCode === 201) {
      setTriggerReload(prev => !prev);
      Toaster.stopLoad(toaster, 'Announcement Added!', 1);

      socketService.sendNewAnnouncement(res.data.announcement || initialAnnouncement);

      setContent('');
      setIsDialogOpen(false);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger className={`w-1/2 max-md:w-full ${triggerClass} `}>
        <Button className="w-full button-gradient">Create New Announcement</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Announcement</DialogTitle>
          <DialogDescription>
            This announcement will be visible to all the participants of this hackathon. Select the typed text for formatting options!
          </DialogDescription>
        </DialogHeader>
        <Editor className="min-h-52" content={content} setContent={setContent} editable limit={1000} />
        <Button onClick={handleSubmit} variant="outline">
          Add Announcement
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewAnnouncement;
