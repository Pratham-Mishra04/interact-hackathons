import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sampleRoleData } from '../teams/create_team';
import { HackathonTeam } from '@/types';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import postHandler from '@/handlers/post_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  team: HackathonTeam;
}

const AddTeamMember = ({ show, setShow, team }: Props) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const hackathon = useSelector(currentHackathonSelector);

  const submitHandler = async () => {
    if (username == '') {
      Toaster.error('Enter Username');
      return;
    } else if (role == '') {
      Toaster.error('Select Role');
      return;
    }

    const formData = { username, role };
    const URL = `/org/${hackathon.organizationID}/hackathons/${hackathon.id}/team/${team.id}/add`;
    const res = await postHandler(URL, formData);
    if (res.statusCode == 200) {
      Toaster.success('Member added to the Team');
      setShow(false);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to {team.title}</DialogTitle>
          <DialogDescription>You can use this admin panel to add any member to any team, given the team is not already full. </DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col gap-3">
          <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter User's Username" />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select User's Role" />
            </SelectTrigger>
            <SelectContent>
              {sampleRoleData.map((role, index) => (
                <SelectItem value={role} key={index}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={submitHandler}>Add Team Member</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMember;
