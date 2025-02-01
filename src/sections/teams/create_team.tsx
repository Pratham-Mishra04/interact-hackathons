import { Input } from '@/components/ui/input';
import { HackathonTrack } from '@/types';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Toaster from '@/utils/toaster';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  submitHandler: (formData: any) => void;
  hackathonID: string;
  tracks: HackathonTrack[] | null;
}

const CreateTeam = ({ show, setShow, submitHandler, hackathonID, tracks }: Props) => {
  const [title, setTitle] = useState('');
  const [regNo, setRegNo] = useState('');
  const [track, setTrack] = useState('');
  const [role, setRole] = useState('');

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new team</DialogTitle>
          <DialogDescription>Fill in the details below to create a new team.</DialogDescription>
        </DialogHeader>
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
        <Button
          onClick={() => {
            if (title && track && role) {
              submitHandler({
                title,
                trackID: track,
                hackathonID,
                role,
                regNo,
              });
            } else {
              Toaster.error('Please fill in all the fields');
            }
          }}
        >
          Create Team
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeam;

export const sampleRoleData = [
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'Designer',
  'Fullstack Developer',
  'Data Scientist',
  'UI/UX Designer',
  'DevOps Engineer',
  'Project Manager',
  'Product Manager',
  'Mobile Developer',
  'Cloud Engineer',
  'AI/ML Researcher',
  'QA Engineer',
  'Business Analyst',
  'Security Specialist',
  'Other',
];
