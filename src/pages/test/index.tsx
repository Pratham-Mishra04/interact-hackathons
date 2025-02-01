'use client';

import { useEffect, useState } from 'react';
import sampleData from '../../../public/sample.json';
import type { GithubRepo } from '@/types/index';
import { Clock, GitCommit, FileText, FolderPlus, FileEdit } from 'lucide-react';

export default function Page() {
  const [repo, setRepo] = useState<GithubRepo | null>(null);

  useEffect(() => {
    setRepo(sampleData.githubRepos[0]);
  }, []);

  if (!repo) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCommit className="text-blue-600" size={20} />
            <h1 className="text-lg font-semibold text-gray-900">Git History</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {/* Repository Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{repo.repoName}</h2>
              <a
                href={repo.repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm transition-colors"
              >
                <GitCommit size={16} />
                {repo.repoLink}
              </a>
            </div>
          </div>

          {/* Commit Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100%-7rem)] overflow-hidden">
            <div className="relative h-full">
              {/* Timeline line */}
              <div className="absolute left-8 lg:left-16 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-100 via-gray-200 to-gray-100" />

              {/* Scrollable commit history */}
              <div className="h-full overflow-y-auto">
                {repo.commitHistories.map((commit, index) => (
                  <div
                    key={commit.id}
                    className="relative transition-all hover:bg-gray-50/80"
                    style={{
                      opacity: 0,
                      animation: `fadeIn 0.3s ease-out ${index * 0.1}s forwards`,
                    }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 lg:left-16 top-1/2 w-2.5 h-2.5 -ml-[5px] rounded-full ring-4 ring-blue-50 bg-blue-500 transform -translate-y-1/2" />

                    <div className="py-6 px-4 lg:px-8 ml-16 lg:ml-28">
                      <div className="flex gap-4">
                        {/* User avatar */}
                        <img
                          src={commit.user.profilePic || '/placeholder.svg'}
                          alt={commit.user.name}
                          className="w-10 h-10 rounded-full ring-1 ring-gray-200 flex-shrink-0"
                        />

                        {/* Commit details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-x-4">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900">{commit.user.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{commit.message}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                              <Clock size={14} />
                              <time dateTime={commit.timestamp}>
                                {new Date(commit.timestamp)
                                  .toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: '2-digit',
                                  })
                                  .toUpperCase()}
                              </time>
                            </div>
                          </div>

                          {/* File changes */}
                          {(commit.addedFiles.length > 0 || commit.modifiedFiles.length > 0) && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                              {commit.addedFiles.map(file => (
                                <div
                                  key={file}
                                  className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100 group hover:bg-green-50 transition-colors"
                                >
                                  <FolderPlus size={16} className="text-green-600" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file}</p>
                                    <p className="text-xs text-gray-500">Added</p>
                                  </div>
                                </div>
                              ))}
                              {commit.modifiedFiles.map(file => (
                                <div
                                  key={file}
                                  className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 group hover:bg-blue-50 transition-colors"
                                >
                                  <FileEdit size={16} className="text-blue-600" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file}</p>
                                    <p className="text-xs text-gray-500">Modified</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Commit metadata */}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded-md">{commit.id.substring(0, 7)}</span>
                            <span className="font-medium">{commit.changes} changes</span>
                            {commit.removedFiles.length > 0 && (
                              <span className="text-red-500 font-medium">{commit.removedFiles.length} files removed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Custom scrollbar */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #e5e7eb transparent;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
