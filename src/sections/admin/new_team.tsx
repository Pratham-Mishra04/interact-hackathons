import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sampleRoleData } from '../teams/create_team';
import { HackathonTrack } from '@/types';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  tracks: HackathonTrack[];
}

const NewTeam = ({ tracks }: Props) => {
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hackathon = useSelector(currentHackathonSelector);

  const submitHandler = async () => {
    const formData = { username, role };
    const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/team/`;
    const res = await postHandler(URL, formData);
    if (res.statusCode == 200) {
      Toaster.success('Team Created');
      setIsDialogOpen(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button className="w-40" variant="outline">
          Add a New Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription>You can use this admin panel to create a new team. </DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col gap-3">
          <Input
            value={title}
            onChange={e => {
              setTitle(e.target.value);
            }}
            placeholder="Enter Team Name"
          />
          <Select value={track} onValueChange={setTrack}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Track" />
            </SelectTrigger>
            <SelectContent>
              {tracks &&
                tracks.map((track, index) => (
                  <SelectItem value={track.id} key={index}>
                    {track.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter Team Leader's Username" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Team Leader's Role" />
            </SelectTrigger>
            <SelectContent>
              {sampleRoleData.map((role, index) => (
                <SelectItem value={role} key={index}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={submitHandler}>Add Team</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeam;
