import React, { useEffect, useMemo, useState } from 'react';
import getHandler from '@/handlers/get_handler';
import { GithubRepo, HackathonTeam } from '@/types';
import { SERVER_ERROR } from '@/config/errors';
import { useDispatch } from 'react-redux';
import { setGithubUsername } from '@/slices/userSlice';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/config/routes';
import { useRouter } from 'next/router';
import isURL from 'validator/lib/isURL';
import Loader from '@/components/common/loader';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import { Plus, Trash, X } from '@phosphor-icons/react';
import deleteHandler from '@/handlers/delete_handler';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const RepositoriesComponent = ({ team }: { team: HackathonTeam }) => {
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [newRepos, setNewRepos] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRepositories = async () => {
      const URL = `/hackathons/${team.hackathonID}/participants/connections/${team.id}`;
      const res = await getHandler(URL, undefined, true);
      if (res.statusCode == 200) {
        setGithubRepos(res.data.githubRepos || []);
        setNewRepos(['']);
      } else {
        Toaster.error(res.data.message || SERVER_ERROR);
      }
      setLoading(false);
    };

    fetchRepositories();
  }, [team]);

  const isValid = useMemo(() => newRepos.every(repo => isURL(repo)), [newRepos]);
  const canAddMore = useMemo(() => newRepos.length + githubRepos.length < 5, [newRepos, githubRepos]);

  const handleSaveRepositories = async () => {
    const URL = `${BACKEND_URL}/auth/github/${team.id}?token=${Cookies.get('token')}&repo_links=${newRepos.join(',')}`;
    window.location.assign(URL);
  };

  const handleRepoDelete = async (repoID: string) => {
    const URL = `/hackathons/${team.hackathonID}/participants/teams/${team.id}/project/github/${repoID}`;
    const res = await deleteHandler(URL);
    if (res.statusCode == 200) {
      setGithubRepos(prev => prev.filter(r => r.id != repoID));
      Toaster.success('Repository deleted successfully');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    const username = new URLSearchParams(window.location.search).get('username');
    const message = new URLSearchParams(window.location.search).get('message');

    if (status || message) {
      const { query } = router;

      if (status) {
        if (status && status == '1') {
          if (username && username != '') dispatch(setGithubUsername(username));
        } else if (status && status == '0') {
          if (message) {
            Toaster.error(message);
            delete query.message;
          }
        }
        delete query.status;
      }

      router.replace({
        pathname: router.pathname,
        query: { ...query },
      });
    }
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="">
          <ul className="list-disc">
            {githubRepos.map((repo, index) => (
              <li key={index} className="flex items-center w-full mb-2">
                <Link
                  href={repo.repoLink}
                  target="_blank"
                  key={index}
                  className="w-full h-8 py-2 px-3 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                >
                  <span className="font-medium">{repo.repoName}</span>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger>
                    <Trash className="h-5 w-5 ml-2 text-red-500 cursor-pointer" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will remove the connected webhook on your repository and we won&apos;t be able to track your progress. It will
                        also deleted the existing tracked analytics on this repository.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRepoDelete(repo.id)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>

          <Dialog>
            <DialogTrigger className="w-full">
              <Button className="w-full" variant="outline">
                Connect Your Project Repos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect your Github Repos</DialogTitle>
                <DialogDescription>
                  This action will make a webhook on the selected repositories, which will be used for activity monitoring and analysis by the judges.
                  You can remove this webhook anytime later.{' '}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {newRepos.map((repo, index) => (
                  <div key={index} className="w-full h-12 flex gap-2">
                    <input
                      type="text"
                      value={repo}
                      onChange={e => setNewRepos(prev => prev.map((repo, i) => (i === index ? e.target.value : repo)))}
                      className="w-full h-full border p-2 rounded-md focus:outline-none"
                      placeholder="Enter GitHub repository URL"
                    />
                    <button
                      onClick={() => setNewRepos(prev => prev.filter((_, i) => i !== index))}
                      className="w-12 h-full flex-center bg-red-500 text-white rounded-md hover:bg-red-700 transition-ease-300"
                    >
                      <X weight="bold" />
                    </button>
                  </div>
                ))}
                {canAddMore ? (
                  <div
                    onClick={() => setNewRepos(prev => [...prev, ''])}
                    className="w-full h-10 text-sm bg-primary_comp hover:bg-primary_comp_hover flex-center gap-2 rounded-md transition-ease-300 cursor-pointer"
                  >
                    New Link <Plus weight="bold" />
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm font-medium">Can only add 5 links.</div>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button onClick={handleSaveRepositories} className="w-full" disabled={!isValid}>
                      Link Selected Repositories
                    </Button>
                  </TooltipTrigger>
                  {!isValid && <TooltipContent>All repo links must be valid URLs</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
              <DialogFooter>*Make sure all the selected repositories are public on Github.</DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default RepositoriesComponent;
