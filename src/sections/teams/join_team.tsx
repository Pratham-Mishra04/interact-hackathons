import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sampleRoleData } from './create_team';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  submitHandler: (formData: any) => void;
}

const JoinTeam = ({ show, setShow, submitHandler }: Props) => {
  const [token, setToken] = useState('');
  const [regNo, setRegNo] = useState('');
  const [role, setRole] = useState('');

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a team</DialogTitle>
          <DialogDescription>Fill in the details below to join a team.</DialogDescription>
        </DialogHeader>
        <Input
          value={token}
          onChange={e => {
            setToken(e.target.value);
          }}
          placeholder="Enter Team Code"
        />
        <Input
          value={regNo}
          onChange={e => {
            setRegNo(e.target.value);
          }}
          placeholder="Enter Your Registration Number"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Your Role" />
          </SelectTrigger>
          <SelectContent>
            {sampleRoleData.map((role, index) => (
              <SelectItem value={role} key={index}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => submitHandler({ token, role, registrationNo: regNo })}>Join Team</Button>
      </DialogContent>
    </Dialog>
  );
};

export default JoinTeam;
