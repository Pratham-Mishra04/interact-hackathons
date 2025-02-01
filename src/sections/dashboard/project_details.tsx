import Links from '@/components/common/links';
import Tags from '@/components/common/tags';
import FigmaIntegration from '@/components/fillers/figma_integration';
import GithubIntegration from '@/components/fillers/github_integration';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PROJECT_PIC_URL } from '@/config/routes';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { Project } from '@/types';
import renderContentWithLinks from '@/utils/funcs/render_content_with_links';
import { getProjectPicHash, getProjectPicURL } from '@/utils/funcs/safe_extract';
import { FigmaLogo } from '@phosphor-icons/react';
import { GitBranch } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import EditorInput from "@/components/form/editor-input";
import Editor from "@/components/editor";

export const ProjectDetails = ({ project }: { project: Project | undefined }) => {
  const [clickedOnReadMore, setClickedOnReadMore] = useState(false);

  const hackathon = useSelector(currentHackathonSelector);

  return !project ? (
    <div className="w-full h-fit flex-center text-center text-4xl font-medium pt-32">Project Not Submitted Yet.</div>
  ) : (
    <div className="w-full p-4 flex max-md:flex-col gap-4">
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
            <Editor editable={false}  content={project.description} />
            {/*<div className="whitespace-pre-line">*/}
            {/*  {project.description.length > 200 ? (*/}
            {/*    clickedOnReadMore ? (*/}
            {/*      project.description*/}
            {/*    ) : (*/}
            {/*      <>*/}
            {/*        {project.description.substring(0, 200)}*/}
            {/*        <span onClick={() => setClickedOnReadMore(true)} className="text-xs italic opacity-60 cursor-pointer">*/}
            {/*          {' '}*/}
            {/*          Read More...*/}
            {/*        </span>*/}
            {/*      </>*/}
            {/*    )*/}
            {/*  ) : (*/}
            {/*    renderContentWithLinks(project.description)*/}
            {/*  )}*/}
            {/*</div>*/}
            <Links links={project.links} />
          </div>
        </div>
      </div>
      <div className="w-1/3 max-md:w-full space-y-4">
        {hackathon.enableGithubIntegration ? (
          project.githubRepos &&
          project.githubRepos.length > 0 && (
            <div className="w-full bg-white p-4 rounded-lg space-y-2">
              <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
                <GitBranch />
                Connected Github Repositories
              </div>
              {project.githubRepos.map((repo, index) => (
                <li key={index} className="flex items-center w-full mb-2">
                  <Link
                    href={repo.repoLink}
                    target="_blank"
                    key={index}
                    className="w-full h-8 py-2 px-3 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                  >
                    <span className="font-medium">{repo.repoName}</span>
                  </Link>
                </li>
              ))}
            </div>
          )
        ) : (
          <GithubIntegration />
        )}
        {hackathon.enableFigmaIntegration ? (
          project.figmaFiles &&
          project.figmaFiles.length > 0 && (
            <div className="w-full bg-white p-4 rounded-lg space-y-2">
              <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
                <FigmaLogo size={24} />
                Connected Figma Files
              </div>
              {project.figmaFiles.map((file, index) => (
                <Link
                  href={file.fileURL}
                  target="_blank"
                  key={index}
                  className="w-full h-8 py-2 px-3 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                >
                  <span className="font-medium line-clamp-1">{file.fileURL}</span>
                </Link>
              ))}
            </div>
          )
        ) : (
          <FigmaIntegration />
        )}
      </div>
    </div>
  );
};
