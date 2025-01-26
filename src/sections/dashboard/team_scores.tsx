import { Input } from '@/components/ui/input';
import { HackathonRound, HackathonRoundScoreMetric, HackathonRoundTeamScoreCard } from '@/types';
import React, { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TextArea from '@/components/form/textarea';
import { useSelector } from 'react-redux';
import { currentHackathonSelector } from '@/slices/hackathonSlice';
import { ORG_URL } from '@/config/routes';
import getHandler from '@/handlers/get_handler';
import Toaster from '@/utils/toaster';
import { SERVER_ERROR } from '@/config/errors';
import postHandler from '@/handlers/post_handler';
import { getHackathonRole } from '@/utils/funcs/hackathons';
import moment from 'moment';
import NumberInput from '@/components/form/number';

const TeamScores = ({ teamID }: { teamID: string }) => {
  const [rounds, setRounds] = useState<HackathonRound[]>([]);
  const [scores, setScores] = useState<HackathonRoundTeamScoreCard[]>([]);
  const [currentRound, setCurrentRound] = useState<HackathonRound | null>(null);
  const [nextRound, setNextRound] = useState<HackathonRound | null>(null);

  const hackathon = useSelector(currentHackathonSelector);

  const getRounds = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/rounds`;
    const res = await getHandler(URL, undefined, true);
    if (res.statusCode === 200) {
      const rounds: HackathonRound[] = res.data.rounds || [];
      setRounds(rounds.sort((a, b) => b.index - a.index));
    } else {
      Toaster.error(res.data?.message || SERVER_ERROR);
    }
  };

  const getCurrentRound = async () => {
    const URL = `/hackathons/${hackathon.id}/participants/round?type=judging`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setCurrentRound(res.data.round);
      setNextRound(res.data.nextRound);
    } else {
      Toaster.error(res.data?.message || SERVER_ERROR);
    }
  };

  useEffect(() => {
    getRounds();
    getScores();
    getCurrentRound();
  }, [teamID]);

  const role = getHackathonRole();

  const getScores = async () => {
    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/score/${teamID}`;
    const res = await getHandler(URL);
    if (res.statusCode === 200) {
      setScores(res.data.scores);
    } else {
      Toaster.error(res.data?.message || SERVER_ERROR);
    }
  };

  const handleSubmit = async (
    hackathonRoundID: string,
    changedMetrics: { id: string; score: string }[],
    isOverallScoreChanged: boolean,
    newOverallScore: string
  ) => {
    const formData = {
      hackathonRoundID,
      hackathonTeamID: teamID,
      scores: changedMetrics.map(metric => ({
        hackathonRoundScoreMetricID: metric.id,
        score: metric.score,
      })),
      overallScore: isOverallScoreChanged ? newOverallScore : '',
    };

    const toaster = Toaster.startLoad('Updating Scores...');

    const URL = `${ORG_URL}/${hackathon.organizationID}/hackathons/${hackathon.id}/score`;
    const res = await postHandler(URL, formData);
    if (res.statusCode === 200) {
      Toaster.stopLoad(toaster, 'Scores Updated', 1);
    } else {
      Toaster.stopLoad(toaster, res.data?.message || SERVER_ERROR, 0);
    }
  };

  const isJudgingAllowed = useMemo(
    () => role == 'admin' && moment().isBetween(moment(currentRound?.judgingStartTime), moment(currentRound?.endTime)),
    [role, currentRound]
  );

  return (
    <div className="w-full p-4 space-y-20">
      {rounds
        .filter(round => {
          if (currentRound) return round.index <= currentRound.index;
          if (nextRound) return round.index <= nextRound.index;
          return true;
        })
        .map((round, index) => {
          return (
            <RoundScorecard
              key={index}
              round={round}
              handleSubmit={handleSubmit}
              isJudgingAllowed={isJudgingAllowed && round.id === currentRound?.id}
              scoreCard={scores.find(score => score.hackathonRoundID === round.id)}
            />
          );
        })}
    </div>
  );
};

const RoundScorecard = ({
  round,
  isJudgingAllowed,
  handleSubmit,
  scoreCard,
}: {
  round: HackathonRound;
  scoreCard?: HackathonRoundTeamScoreCard;
  isJudgingAllowed: boolean;
  handleSubmit: (
    hackathonRoundID: string,
    changedMetrics: { id: string; score: string }[],
    isOverallScoreChanged: boolean,
    newOverallScore: string
  ) => void;
}) => {
  const [inputScores, setInputScores] = useState<{ [key: string]: any }>({});

  const handleInputChange = (id: string, value: any) => {
    setInputScores(prevScores => ({
      ...prevScores,
      [id]: value,
    }));
  };

  const averageScore = useMemo(() => {
    const numericScores = round.metrics.filter(metric => metric.type === 'number').map(metric => Number(inputScores[metric.id]) || 0);
    const totalScore = numericScores?.reduce((acc, curr) => acc + curr, 0);
    return numericScores?.length > 0 ? (totalScore / numericScores.length).toFixed(2) : '0';
  }, [inputScores, round]);

  useEffect(() => {
    if (scoreCard) {
      if (scoreCard.overallScore) handleInputChange('overallScore', scoreCard.overallScore);
      scoreCard.scores?.map(metric => {
        handleInputChange(metric.hackathonRoundScoreMetricID, metric.score);
      });
    }
  }, [scoreCard]);

  const preSubmit = () => {
    const previousScores =
      scoreCard?.scores?.reduce((acc, metric) => {
        acc[metric.hackathonRoundScoreMetricID] = metric.score;
        return acc;
      }, {} as { [key: string]: any }) || {};

    const changedMetrics = round.metrics.map(metric => {
      const newValue = String(inputScores[metric.id]);
      const previousValue =
        metric.type == 'text'
          ? String(previousScores[metric.id]) == 'undefined'
            ? ''
            : String(previousScores[metric.id])
          : String(previousScores[metric.id]);
      const isChanged = previousValue !== newValue;

      return {
        id: metric.id,
        score: newValue,
        changed: isChanged,
      };
    });

    previousScores['overallScore'] = scoreCard?.overallScore || '';

    handleSubmit(
      round.id,
      changedMetrics.filter(metric => metric.changed),
      String(previousScores['overallScore']) !== String(inputScores['overallScore']),
      inputScores['overallScore']
    );
  };

  return (
    <div className="w-full space-y-8">
      <div className="w-1/2 mx-auto h-12 bg-blue-400 flex-center text-white font-semibold rounded-lg">Round {round.index + 1}</div>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {round.metrics?.map((metric, index) => (
          <div key={index} className="w-full p-4 bg-white rounded-md flex flex-col justify-around gap-4">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-medium">{metric.title}</h1>
              <p className="mb-4">Description: {metric.description}</p>
            </div>

            {metric.type === 'number' && (
              <NumberInput val={Number(inputScores[metric.id])} setVal={val => handleInputChange(metric.id, val)} disabled={!isJudgingAllowed} />
            )}

            {metric.type === 'text' && (
              <TextArea
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                placeholder="Enter Remarks"
                disabled={!isJudgingAllowed}
                maxLength={300}
                val={inputScores[metric.id] || ''}
                setVal={val => handleInputChange(metric.id, val)}
              />
            )}

            {metric.type === 'select' && metric.options && metric.options.length > 0 && (
              <Select disabled={!isJudgingAllowed} value={inputScores[metric.id] || ''} onValueChange={value => handleInputChange(metric.id, value)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select Option" />
                </SelectTrigger>
                <SelectContent>
                  {metric.options.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {metric.type === 'boolean' && (
              <div className="w-full flex-center space-x-6">
                <button
                  disabled={!isJudgingAllowed}
                  onClick={() => handleInputChange(metric.id, 'true')}
                  className={`w-1/2 h-10 ${
                    inputScores[metric.id] != undefined && inputScores[metric.id] == 'true'
                      ? 'bg-green-400 border-primary_black border-[1px]'
                      : 'bg-green-700 hover:bg-green-800 disabled:hover:bg-green-600'
                  } flex-center disabled:opacity-50 text-white rounded-lg text-lg font-medium transition-ease-300 cursor-pointer disabled:cursor-not-allowed`}
                >
                  Yes
                </button>
                <button
                  disabled={!isJudgingAllowed}
                  onClick={() => handleInputChange(metric.id, 'false')}
                  className={`w-1/2 h-10 ${
                    inputScores[metric.id] != undefined && inputScores[metric.id] == 'false'
                      ? 'bg-red-400 border-primary_black border-[1px]'
                      : 'bg-red-700 hover:bg-red-800 disabled:hover:bg-red-600'
                  } flex-center disabled:opacity-50 text-white rounded-lg text-lg font-medium transition-ease-300 cursor-pointer disabled:cursor-not-allowed`}
                >
                  No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="w-full p-3 bg-white text-primary_text rounded-md flex flex-col md:flex-row md:justify-between gap-4">
        <span className="w-full flex flex-col md:flex-row items-center gap-2">
          <Trophy size={32} />
          <h1 className="text-xl md:text-2xl font-semibold text-nowrap">Overall Round Score</h1>
          {isJudgingAllowed ? (
            <div className="grow flex max-md:flex-col items-center justify-between gap-4">
              <div className="flex-center max-md:flex-col gap-2">
                <Input
                  type="number"
                  className="bg-white text-black w-full md:w-60"
                  placeholder="Enter Score"
                  value={inputScores['overallScore'] || ''}
                  onChange={e => handleInputChange('overallScore', e.target.value)}
                />
                <span className="text-sm font-medium">Suggested: {averageScore} (Avg of all numeric metrics)</span>
              </div>
              <Button onClick={preSubmit} className="bg-primary_text/90 hover:bg-primary_text w-full md:w-fit px-12">
                Update Scores
              </Button>
            </div>
          ) : (
            <h1 className="flex-center gap-2 text-3xl font-semibold">
              <span className="hidden md:block">:</span> {inputScores['overallScore'] || '-'}
            </h1>
          )}
        </span>
      </div>
    </div>
  );
};

export default TeamScores;
