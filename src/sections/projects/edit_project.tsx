import Input from '@/components/form/input';
import Links from '@/components/form/links';
import Select from '@/components/form/select';
import Tags from '@/components/form/tags';
import TextArea from '@/components/form/textarea';
import { SERVER_ERROR } from '@/config/errors';
import { PROJECT_URL } from '@/config/routes';
import patchHandler from '@/handlers/patch_handler';
import { userSelector } from '@/slices/userSlice';
import { HackathonTeam, Project } from '@/types';
import categories from '@/utils/categories';
import Toaster from '@/utils/toaster';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr';

interface Props {
  project: Project;
  setTeam: React.Dispatch<React.SetStateAction<HackathonTeam | null>>;
}

const EditProject = ({ project, setTeam }: Props) => {
  const [description, setDescription] = useState(project.description);
  const [tagline, setTagline] = useState(project.tagline);
  const [category, setCategory] = useState(project.category);
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [links, setLinks] = useState<string[]>(project.links || []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [mutex, setMutex] = useState(false);

  const user = useSelector(userSelector);

  const handleSubmit = async () => {
    if (description.trim() == '') {
      Toaster.error('Enter Description');
      return;
    }
    if (category.trim() == '') {
      Toaster.error('Select Category');
      return;
    }
    if (category == 'Select Category') {
      Toaster.error('Select Category');
      return;
    }
    if (tags.length == 0) {
      Toaster.error('Tags cannot be empty');
      return;
    }
    if (project.links.length > 0 && links.length == 0) {
      Toaster.error('Links cannot be empty');
      return;
    }

    if (mutex) return;
    setMutex(true);

    const toaster = Toaster.startLoad('Editing your project...');

    const formData = new FormData();

    if (tagline != project.tagline) formData.append('tagline', tagline);
    if (description != project.description) formData.append('description', description);
    // if (isArrEdited(tags, project.tags))
    tags?.forEach(tag => formData.append('tags', tag));
    // if (isArrEdited(links, project.links))
    links?.forEach(link => formData.append('links', link));
    if (category != project.category) formData.append('category', category);

    const URL = `${PROJECT_URL}/${project.slug}`;

    const res = await patchHandler(URL, formData);

    if (res.statusCode === 200) {
      const newProject = res.data.project;
      newProject.user = user;

      setTeam(prev => {
        return { ...(prev as HackathonTeam), project: newProject };
      });

      Toaster.stopLoad(toaster, 'Project Edited', 1);
      setIsDialogOpen(false);
    } else Toaster.stopLoad(toaster, res.data.message || SERVER_ERROR, 0);

    setMutex(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="w-12 h-12 p-2 flex-center hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-full cursor-pointer transition-ease-300">
          <PencilSimple size={24} />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md min-w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-3xl">Edit Project</DialogTitle>
        </DialogHeader>
        <div className="w-full h-fit flex flex-col max-lg:items-center gap-4 max-lg:gap-6 max-lg:pb-4">
          <Select label="Project Category" val={category} setVal={setCategory} options={categories} required={true} />
          <Input label="Project Tagline" val={tagline} setVal={setTagline} maxLength={50} required={true} />
          <TextArea label="Project Description" val={description} setVal={setDescription} maxLength={1000} />
          <Tags label="Project Tags" tags={tags} setTags={setTags} maxTags={10} required={true} />
          <Links label="Project Links" links={links} setLinks={setLinks} maxLinks={10} />
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

export default EditProject;
