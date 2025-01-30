import React, { useState } from 'react';
import { Announcement } from '@/types';
import { ORG_URL } from '@/config/routes';
import moment from 'moment';
import { useSelector } from 'react-redux';
import deleteHandler from '@/handlers/delete_handler';
import Toaster from '@/utils/toaster';
import patchHandler from '@/handlers/patch_handler';
import { SERVER_ERROR } from '@/config/errors';
import ConfirmDelete from './common/confirm_delete';
import { checkParticularOrgAccess } from '@/utils/funcs/access';
import { ORG_SENIOR } from '@/config/constants';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import Editor from './editor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ShineBorder from './ui/shine-border';

interface Props {
  announcement: Announcement;
  setAnnouncements?: React.Dispatch<React.SetStateAction<Announcement[]>>;
  isAdmin?: boolean;
}

const AnnouncementCard = ({ announcement, setAnnouncements, isAdmin = false }: Props) => {
  const [clickedOnEdit, setClickedOnEdit] = useState(false);
  const [clickedOnDelete, setClickedOnDelete] = useState(false);

  const [caption, setCaption] = useState(announcement.content);

  const hackathon = useSelector(currentHackathonSelector);

  const handleDelete = async () => {
    const toaster = Toaster.startLoad('Deleting your Announcement...');

    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/announcements/${announcement.id}`;

    const res = await deleteHandler(URL);

    if (res.statusCode === 204) {
      if (setAnnouncements) setAnnouncements(prev => prev.filter(a => a.id != announcement.id));
      setClickedOnDelete(false);
      Toaster.stopLoad(toaster, 'Announcement Deleted', 1);
    } else {
      if (res.data.message) Toaster.stopLoad(toaster, res.data.message, 0);
      else Toaster.stopLoad(toaster, SERVER_ERROR, 0);
    }
  };

  const handleEdit = async () => {
    if (caption == announcement.content || caption.trim().length == 0 || caption.replace(/\n/g, '').length == 0) {
      setClickedOnEdit(false);
      return;
    }
    const toaster = Toaster.startLoad('Editing Announcement...');

    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/announcements/${announcement.id}`;

    const res = await patchHandler(URL, { content: caption });
    if (res.statusCode === 200) {
      if (setAnnouncements)
        setAnnouncements(prev =>
          prev.map(a => {
            if (a.id == announcement.id) return { ...a, content: caption, edited: true };
            else return a;
          })
        );
      Toaster.stopLoad(toaster, 'Announcement Edited', 1);
    } else {
      Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);
    }
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const className =
      'w-full h-fit relative overflow-clip bg-white font-primary flex gap-1 rounded-lg border-gray-300 border-[1px] dark:border-b-[1px] p-2 shadow-sm hover:shadow-md transition-ease-300 animate-fade_third';

    return (
      <>
        {clickedOnDelete && <ConfirmDelete setShow={setClickedOnDelete} handleDelete={handleDelete} />}
        {announcement.isNew ? (
          <ShineBorder className={className} color={['#A07CFE', '#98D8EF', '#4B9EFF']} borderRadius={7} borderWidth={1.5}>
            {children}
          </ShineBorder>
        ) : (
          <div
            className={className + ' text-white'}
            style={{
              background: '-webkit-linear-gradient(0deg, #607ee7,#478EE1)',
            }}
          >
            {children}
          </div>
        )}
      </>
    );
  };

  return (
    <Wrapper>
      <div className="w-full space-y-2">
        <div className="w-full flex items-center justify-between gap-2 text-xs text-gray-200">
          <div>{moment(announcement.createdAt).format('HH:MM A, DD MMM')}</div>
          <div className="w-fit flex-center gap-2">
            {announcement.isEdited && <div>(edited)</div>}
            <DropdownMenu>
              {isAdmin && checkParticularOrgAccess(ORG_SENIOR, announcement.hackathon?.organization || null) && (
                <DropdownMenuTrigger className="text-xxs">•••</DropdownMenuTrigger>
              )}
              <DropdownMenuContent>
                {/* {!clickedOnEdit && <DropdownMenuItem onClick={() => setClickedOnEdit(true)}>Edit</DropdownMenuItem>} */}
                <DropdownMenuItem onClick={() => setClickedOnDelete(true)} className="hover:text-primary_danger">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {clickedOnEdit ? (
          <div className="relative flex flex-col gap-2">
            <Editor className="min-h-40" content={announcement.content} setContent={setCaption} editable={true} />
            <div className="dark:text-white flex items-center justify-end gap-2 max-md:gap-1">
              <div
                onClick={() => setClickedOnEdit(false)}
                className="border-[1px] border-primary_black flex-center rounded-full w-16 text-xs p-1 cursor-pointer"
              >
                cancel
              </div>
              {caption == announcement.content ? (
                <div className="bg-primary_black bg-opacity-50 text-white flex-center rounded-full w-16 text-xs p-1 cursor-default">save</div>
              ) : (
                <div onClick={handleEdit} className="bg-primary_black text-white flex-center rounded-full w-16 text-xs p-1 cursor-pointer">
                  save
                </div>
              )}
            </div>
          </div>
        ) : (
          <Editor content={announcement.content} editable={false} />
        )}
      </div>
    </Wrapper>
  );
};

export default AnnouncementCard;
