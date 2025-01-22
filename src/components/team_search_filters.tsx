import React, { useEffect, useState } from 'react';
import { MagnifyingGlass, Newspaper } from '@phosphor-icons/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from './ui/input';
import { HackathonTrack } from '@/types';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';

interface TeamSearchFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  track: string;
  setTrack: (value: string) => void;
  eliminated: string;
  setEliminated: (value: string) => void;
  overallScore: number;
  setOverallScore: (value: number) => void;
  order: string;
  setOrder: (value: string) => void;
  showAll?: boolean;
  tracks: HackathonTrack[];
}

const TeamSearchFilters: React.FC<TeamSearchFiltersProps> = ({
  search,
  setSearch,
  track,
  setTrack,
  eliminated,
  setEliminated,
  overallScore,
  setOverallScore,
  order,
  setOrder,
  tracks,
  showAll = true,
}) => {
  const [tempSearch, setTempSearch] = useState(search);

  const hackathon = useSelector(currentHackathonSelector);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearch(tempSearch);
    }
  };

  return (
    <section className="--search-filters flex flex-col md:flex-row items-center md:justify-between gap-4">
      <div className="--search-box w-full flex-grow relative h-8 md:h-10">
        <Input
          className="bg-white border-1 border-[#dedede] focus-visible:border-primary_text ring-0 focus-visible:ring-0 pl-10 h-10"
          placeholder="Search"
          value={tempSearch}
          onChange={el => setTempSearch(el.target.value)}
          onKeyUp={handleKeyUp}
        />
        <MagnifyingGlass size={16} className="absolute top-1/2 -translate-y-1/2 left-4" />
      </div>
      <div className="--filters flex max-md:w-full lg:flex-nowrap items-center gap-[2%] md:gap-2">
        <Select value={track} onValueChange={setTrack}>
          <SelectTrigger className="w-[49%] md:w-32 min-w-fit bg-white h-10 border-1 border-[#dedede]">
            <Newspaper size={16} />
            <SelectValue placeholder="Tracks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key={-1} value={'none'}>
              All Tracks
            </SelectItem>
            {tracks?.map(track => (
              <SelectItem key={track.id} value={track.id}>
                {track.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={order} onValueChange={setOrder}>
          <SelectTrigger className="w-[49%] md:w-32 min-w-fit bg-white h-10 border-1 border-[#dedede]">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            {showAll && <SelectItem value={hackathon.isEnded ? 'overall_score' : 'round_score'}>Scores</SelectItem>}
          </SelectContent>
        </Select>

        {/* <div className="flex items-center gap-2">
          <label htmlFor="overall-score" className="text-sm">
            Score
          </label>
          <input
            id="overall-score"
            type="number"
            value={overallScore}
            onChange={e => setOverallScore(Number(e.target.value))}
            className="w-20 h-8 md:h-10 border-[2px] border-[#dedede] text-center"
          />
        </div> */}

        {showAll && (
          <Select value={eliminated} onValueChange={setEliminated}>
            <SelectTrigger className="w-[49%] md:w-32 min-w-fit bg-white h-10 border-1 border-[#dedede]">
              <SelectValue placeholder="Elimination Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All</SelectItem>
              <SelectItem value="eliminated">Eliminated</SelectItem>
              <SelectItem value="not_eliminated">Not Eliminated</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    </section>
  );
};

export default TeamSearchFilters;
