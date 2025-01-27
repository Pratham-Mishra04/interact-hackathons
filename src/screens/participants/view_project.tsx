import React from 'react';
import OverviewComponent from '@/sections/projects/overview';
import RepositoriesComponent from '@/sections/projects/repositories';
import FigmaComponent from '@/sections/projects/figma';
import { HackathonTeam, Project } from '@/types';
import Separator from '@/components/ui/separator';
import { FigmaLogo, Info } from '@phosphor-icons/react';
import { GitBranch } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectViewProps {
  project: Project;
  team: HackathonTeam;
  setTeam: React.Dispatch<React.SetStateAction<HackathonTeam | null>>;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, team, setTeam }) => {
  return (
    <div className="w-full flex max-md:flex-col gap-4">
      <OverviewComponent project={project} setTeam={setTeam} />

      <div className="w-1/3 max-md:w-full space-y-4">
        <div className="w-full bg-white p-4 rounded-xl space-y-4">
          <ProjectBlockHeader title="Connected Github Repositories" icon={<GitBranch />} />
          <RepositoriesComponent team={team} />
        </div>
        <div className="w-full bg-white p-4 rounded-xl space-y-4">
          <ProjectBlockHeader
            title="Connected Figma Files"
            icon={<FigmaLogo size={24} />}
            toolTip="Designers of the team can sync their accounts and then add their respective figma files."
          />
          <FigmaComponent team={team} />
        </div>
      </div>
    </div>
  );
};

export const ProjectBlockHeader = ({
  title,
  icon,
  separator = false,
  toolTip,
}: {
  title: string;
  icon: React.ReactNode;
  separator?: boolean;
  toolTip?: string;
}) => {
  return (
    <div className="space-y-2">
      <div className="text-lg font-semibold text-primary_text flex items-center gap-2">
        {icon}
        {title}

        {toolTip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info />
              </TooltipTrigger>
              <TooltipContent>{toolTip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {separator && <Separator className="border-primary_text" />}
    </div>
  );
};

export default ProjectView;
