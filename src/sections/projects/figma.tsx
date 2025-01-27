import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import getHandler from '@/handlers/get_handler';
import postHandler from '@/handlers/post_handler';
import { useDispatch } from 'react-redux';
import { setFigmaUsername, userSelector } from '@/slices/userSlice';
import { useSelector } from 'react-redux';
import { SERVER_ERROR } from '@/config/errors';
import { BACKEND_URL } from '@/config/routes';
import { useRouter } from 'next/router';
import { FigmaFile, HackathonTeam } from '@/types';
import Loader from '@/components/common/loader';
import { useMemo } from 'react';
import isURL from 'validator/lib/isURL';
import Link from 'next/link';
import Toaster from '@/utils/toaster';
import deleteHandler from '@/handlers/delete_handler';
import { Plus, Trash, X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FigmaComponent = ({ team }: { team: HackathonTeam }) => {
  const [figmaFiles, setFigmaFiles] = useState<FigmaFile[]>([]);
  const [newFigmaFiles, setNewFigmaFiles] = useState<string[]>(['']);
  const [loading, setLoading] = useState<boolean>(true);

  const user = useSelector(userSelector);

  const isValid = useMemo(() => newFigmaFiles.every(repo => isURL(repo)), [newFigmaFiles]);
  const canAddMore = useMemo(() => newFigmaFiles.length + figmaFiles.length < 5, [newFigmaFiles, figmaFiles]);

  const handleSaveFigmaFiles = async () => {
    const URL = `/hackathons/${team.hackathonID}/participants/teams/${team.id}/project/figma?file_urls=${newFigmaFiles.join(',')}`;
    const body = {};
    const res = await postHandler(URL, body);
    if (res.statusCode == 201) {
      setFigmaFiles(prev => [...prev, ...(res.data.figmaFiles || [])]);
      setNewFigmaFiles(['']);
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('status');
    const username = new URLSearchParams(window.location.search).get('username');
    const tab = new URLSearchParams(window.location.search).get('tab');
    const message = new URLSearchParams(window.location.search).get('message');

    if (status || message) {
      const { query } = router;

      if (status) {
        if (status && status == '1') {
          if (username && username != '' && tab && tab == 'figma') {
            Toaster.success('Synced with Figma');
            dispatch(setFigmaUsername(username));
          }
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

  const handleFigmaLogin = async () => {
    const URL = `${BACKEND_URL}/auth/figma?token=${Cookies.get('token')}`;
    window.location.assign(URL);
  };

  const handleFigmaDelete = async (repo: string) => {
    const URL = `/hackathons/${team.hackathonID}/participants/teams/${team.id}/project/figma/${repo}?fileID=${repo}`;
    const res = await deleteHandler(URL, { projectID: team.projectID });
    if (res.statusCode == 200) {
      setFigmaFiles(prev => prev.filter(r => r.id != repo));
      Toaster.success('Repository deleted successfully');
    } else {
      Toaster.error(res.data.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    const fetchFigmaLinks = async () => {
      const URL = `/hackathons/${team.hackathonID}/participants/connections/${team.id}`;
      const res = await getHandler(URL, undefined, true);
      if (res.statusCode == 200) {
        setFigmaFiles(res.data.figmaFiles);
      } else {
        Toaster.error(res.data.message || SERVER_ERROR);
      }
      setLoading(false);
    };

    fetchFigmaLinks();
  }, [team.hackathonID, team.id]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : user.figmaUsername ? (
        <div>
          <ul className="list-disc">
            {figmaFiles.map((file, index) => (
              <li key={index} className="flex items-center">
                <Link
                  href={file.fileURL}
                  target="_blank"
                  key={index}
                  className="w-[calc(100%-32px)] h-8 py-2 px-3 mb-2 rounded-lg flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
                >
                  <span className="font-medium line-clamp-1">{file.fileURL}</span>
                </Link>
                <Trash className="h-5 w-5 ml-2 text-red-500 cursor-pointer" onClick={() => handleFigmaDelete(file.id)} />
              </li>
            ))}
          </ul>

          <Dialog>
            <DialogTrigger className="w-full">
              <Button className="w-full" variant="outline">
                Connect Your Project Figma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect your Figma Files</DialogTitle>
                <DialogDescription>
                  This action will make a link on the selected file, which will be used for activity monitoring and analysis by the judges. You can
                  remove this link anytime later.{' '}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {newFigmaFiles.map((file, index) => (
                  <div key={index} className="w-full h-12 flex gap-2">
                    <input
                      type="text"
                      value={file}
                      onChange={e => setNewFigmaFiles(prev => prev.map((repo, i) => (i === index ? e.target.value : repo)))}
                      className="w-full h-full border p-2 rounded-md focus:outline-none"
                      placeholder="Enter Figma file URL"
                    />
                    <button
                      onClick={() => setNewFigmaFiles(prev => prev.filter((_, i) => i !== index))}
                      className="w-12 h-full flex-center bg-red-500 text-white rounded-md hover:bg-red-700 transition-ease-300"
                    >
                      <X weight="bold" />
                    </button>
                  </div>
                ))}
                {canAddMore ? (
                  <div
                    onClick={() => setNewFigmaFiles(prev => [...prev, ''])}
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
                    <Button onClick={handleSaveFigmaFiles} className="w-full" disabled={!isValid}>
                      Link Selected Files
                    </Button>
                  </TooltipTrigger>
                  {!isValid && <TooltipContent>All file links must be valid URLs</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
              <DialogFooter>*Make sure all the selected file are public on Figma.</DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Button onClick={handleFigmaLogin} className="w-full" variant="outline">
          Sync with Figma
        </Button>
      )}
    </div>
  );
};

export default FigmaComponent;
