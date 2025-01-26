import Links from '@/components/common/links';
import Tags from '@/components/common/tags';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PROJECT_PIC_URL } from '@/config/routes';
import { Project } from '@/types';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { FigmaLogo } from '@phosphor-icons/react';
import { GitBranch } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

export const ProjectDetails = ({ project }: { project: Project | undefined }) => {
  const [clickedOnReadMore, setClickedOnReadMore] = useState(false);
  return !project ? (
    <div className="w-full h-fit flex-center text-center text-4xl font-medium pt-32">Project Not Submitted Yet.</div>
  ) : (
    <div className="w-full p-4 flex space-x-4">
      <div className="w-2/3 max-md:w-full space-y-4 bg-white dark:bg-dark_primary_comp rounded-lg p-4 transition-ease-300">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full relative group">
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
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex items-center justify-between flex-wrap gap-4">
              <div className="w-fit font-bold text-4xl">{project.title}</div>
            </div>
            <div className="font-semibold text-lg">{project.tagline}</div>
            <Tags tags={project.tags} displayAll />
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
      </div>
      <div className="w-1/3 space-y-4">
        <div className="w-full bg-white p-4 rounded-lg">
          <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
            <GitBranch />
            Connected Github Repositories
          </div>
        </div>

        <div className="w-full bg-white p-4 rounded-lg">
          <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
            <FigmaLogo size={24} />
            Connected Figma Files
          </div>
        </div>
      </div>
    </div>
  );
};
