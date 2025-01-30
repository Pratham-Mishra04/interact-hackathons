import Input from '@/components/form/input';
import Links from '@/components/form/links';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
import TextArea from '@/components/form/textarea';
import { SERVER_ERROR } from '@/config/errors';
import postHandler from '@/handlers/post_handler';
import { userSelector } from '@/slices/userSlice';
import { HackathonTeam } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Props {
  team: HackathonTeam;
  setTeam: React.Dispatch<React.SetStateAction<HackathonTeam | null>>;
}

const NewProject = ({ team, setTeam }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const handleSubmit = async () => {
    if (title.trim() == '') {
      Toaster.error('Title cannot be empty');
      return;
    }
    if (category.trim() == '' || category == 'Select Category') {
      Toaster.error('Select Category');
      return;
    }
    if (tagline.trim() == '') {
      Toaster.error('Tagline cannot be empty');
      return;
    }
    if (description.trim() == '') {
      Toaster.error('Description cannot be empty');
      return;
    }
    if (tags.length < 1) {
      Toaster.error('Enter at least 1 tag');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Adding your project...');

    const formData = new FormData();

    formData.append('title', title);
    formData.append('tagline', tagline);
    formData.append('description', description);
    tags.forEach(tag => formData.append('tags', tag));
    links.forEach(link => formData.append('links', link));
    formData.append('category', category);
    const URL = `/hackathons/${team.hackathonID}/participants/teams/${team.id}/project`;

    const res = await postHandler(URL, formData, 'multipart/form-data');

    if (res.statusCode === 201) {
      const project = res.data.project;
      project.user = user;

      setTeam(prev => {
        return { ...(prev as HackathonTeam), projectID: project.id, project };
      });

      setTitle('');
      setTagline('');
      setDescription('');
      setTags([]);
      setLinks([]);
      setIsDialogOpen(false);

      Toaster.stopLoad(toaster, 'Project Added', 1);
    } else {
      if (res.data.message) {
        Toaster.stopLoad(toaster, res.data.message, 0);
      } else {
        Toaster.stopLoad(toaster, SERVER_ERROR, 0);
      }
    }
    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="w-4/5 mx-auto h-90 bg-white shadow-md rounded-xl flex items-center justify-around p-4">
          <Image width={350} height={150} src={'/fillers/project.svg'} alt="" />
          <div className="space-y-4">
            <div className="text-2xl font-medium">Don&apos;t Fall Behind. Start Now!</div>
            <Button className="w-full bg-sky-400 hover:bg-sky-500 py-7 text-lg">
              Create a New Project <Plus size={32} />
            </Button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">New Project</DialogTitle>
        </DialogHeader>
        <div className="w-full h-fit flex flex-col max-lg:items-center gap-4 max-lg:gap-6 max-lg:pb-4">
          <Input label="Project Title" val={title} setVal={setTitle} maxLength={25} required={true} />
          <Select label="Project Category" val={category} setVal={setCategory} options={categories} required={true} />
          <Input label="Project Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
          <TextArea label="Project Description" val={description} setVal={setDescription} maxLength={1000} />
          <Tags label="Project Tags" tags={tags} setTags={setTags} maxTags={10} required={true} />
          <Links label="Project Links" links={links} setLinks={setLinks} maxLinks={5} />
        </div>
        <DialogFooter className="w-full flex-center">
          <Button onClick={handleSubmit} type="button" variant="outline" className="w-full">
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProject;
