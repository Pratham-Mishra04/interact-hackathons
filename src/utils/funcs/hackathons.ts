import { store } from '@/store';
import { Hackathon, HackathonRound } from '@/types';
import moment from 'moment';

export const HACKATHON_NOT_STARTED = 'not started';
export const HACKATHON_TEAM_REGISTRATION = 'team registration';
export const HACKATHON_TEAM_ENDED = 'team registration ended';
export const HACKATHON_LIVE = 'is live';
export const HACKATHON_COMPLETED = 'completed';

const user = store.getState().user;
const hackathonState = store.getState().hackathon;

export const getHackathonStage = (
  hackathon: Hackathon,
  roundProvided?: boolean,
  currentRound?: HackathonRound,
  nextRound?: HackathonRound
): string => {
  const now = moment();
  const teamFormationStartTime = moment(hackathon.teamFormationStartTime);
  const teamFormationEndTime = moment(hackathon.teamFormationEndTime);

  if (hackathon.isEnded) {
    return HACKATHON_COMPLETED;
  } else if (now.isBefore(teamFormationStartTime)) {
    return HACKATHON_NOT_STARTED;
  } else if (now.isBetween(teamFormationStartTime, teamFormationEndTime, null, '[)')) {
    return HACKATHON_TEAM_REGISTRATION;
  } else if (roundProvided && !currentRound && nextRound?.index == 0) {
    return HACKATHON_TEAM_ENDED;
  }
  return HACKATHON_LIVE;
};

export const getHackathonRole = (hackathonParam?: Hackathon): 'admin' | 'org' | 'participant' | 'none' => {
  const hackathon = hackathonParam || hackathonState;
  if (hackathonParam) {
    if (hackathonParam.coordinators?.map(u => u.id).includes(user.id) || hackathonParam.judges?.map(u => u.id).includes(user.id)) return 'admin';
  } else {
    if (hackathonState.coordinators?.includes(user.id) || hackathonState.judges?.includes(user.id)) return 'admin';
  }
  if (user.organizationMemberships?.map(m => m.organizationID).includes(hackathon.organizationID)) return 'org';
  if (user.registeredEvents?.includes(hackathon.eventID)) return 'participant';

  return 'participant';
};
