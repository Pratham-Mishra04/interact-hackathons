import React, { useState } from 'react';
import { Project, HackathonTeam } from '@/types'; // Assuming HackathonTeam type is defined in types
import Tags from '@/components/common/tags';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import Links from '@/components/common/links';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PROJECT_PIC_URL } from '@/config/routes';
import Image from 'next/image';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { PencilSimple, ReadCvLogo } from '@phosphor-icons/react';
import { ProjectBlockHeader } from '@/screens/participants/view_project';
import EditProject from './edit_project';
import EditProjectImages from './edit_project_images';

interface OverviewComponentProps {
  project: Project;
  setTeam: React.Dispatch<React.SetStateAction<HackathonTeam | null>>;
}

const OverviewComponent: React.FC<OverviewComponentProps> = ({ project, setTeam }) => {
  const [clickedOnReadMore, setClickedOnReadMore] = useState(false);
  const [clickedOnEditProjectImages, setClickedOnEditProjectImages] = useState(false);

  return (
    <div className="w-2/3 max-md:w-full bg-white rounded-xl p-6 space-y-6">
      <ProjectBlockHeader title="Overview" icon={<ReadCvLogo size={32} />} separator />
      <div className="w-full flex max-md:flex-col items-start gap-10">
        <div className="w-1/3 max-md:w-full relative group">
          <EditProjectImages
            project={project}
            setTeam={setTeam}
            isDialogOpen={clickedOnEditProjectImages}
            setIsDialogOpen={setClickedOnEditProjectImages}
          />
          <div
            onClick={() => setClickedOnEditProjectImages(true)}
            className="w-full h-full absolute top-0 right-0 flex-center gap-2 hover:bg-[#ffffffa3] opacity-0 hover:opacity-100 font-medium rounded-lg transition-ease-300 cursor-pointer z-10"
          >
            <PencilSimple size={20} weight="bold" /> Edit Cover
          </div>
          {project.images && project.images.length > 1 ? (
            <Carousel
              className="w-full"
              opts={{
                align: 'center',
              }}
            >
              <CarouselContent>
                {project.images.map((image, index) => {
                  let imageHash = 'no-hash';
                  if (project.hashes && index < project.hashes.length) imageHash = project.hashes[index];
                  return (
                    <CarouselItem key={image}>
                      <Image
                        crossOrigin="anonymous"
                        width={1920}
                        height={1080}
                        className="w-full rounded-lg"
                        alt={'Project Pic'}
                        src={`${PROJECT_PIC_URL}/${image}`}
                        placeholder="blur"
                        blurDataURL={imageHash}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <Image
              crossOrigin="anonymous"
              className="w-full rounded-lg"
              src={getProjectPicURL(project)}
              alt="Project Cover"
              width={1920}
              height={1080}
              placeholder="blur"
              blurDataURL={getProjectPicHash(project)}
            />
          )}
        </div>
        <div className="w-2/3 max-md:w-full space-y-4">
          <div className="w-full flex justify-between">
            <div className="w-[calc(100%-48px)] font-bold text-5xl">{project.title}</div>
            <EditProject project={project} setTeam={setTeam} />
          </div>
          <div className="font-semibold text-lg">{project.tagline}</div>
          <Tags tags={project?.tags} displayAll />
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="whitespace-pre-line">
          {project.description.length > 200 ? (
            clickedOnReadMore ? (
              project.description
            ) : (
              <>
                {project.description.substring(0, 200)}
                <span onClick={() => setClickedOnReadMore(true)} className="text-xs italic opacity-60 cursor-pointer">
                  {' '}
                  Read More...
                </span>
              </>
            )
          ) : (
            renderContentWithLinks(project.description)
          )}
        </div>
        <Links links={project.links} />
      </div>
    </div>
  );
};

export default OverviewComponent;
