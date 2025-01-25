import { updateCurrentHackathon } from '@/slices/hackathonSlice';
import { store } from '@/store';
import { Announcement, Hackathon } from '@/types';
import { initialAnnouncement } from '@/types/initials';

export class WSEvent {
  type = '';
  payload = {};
  constructor(type: string, payload: any) {
    this.type = type;
    this.payload = payload;
  }
}

export const getWSEvent = (evt: MessageEvent<any>) => {
  const eventData = JSON.parse(evt.data);
  return new WSEvent(eventData.type, eventData.payload);
};

export class SetupHackathonEvent {
  hackathonID = '';

  constructor(hackathonID: string) {
    this.hackathonID = hackathonID;
  }
}

export class NewAnnouncementEvent {
  announcement = initialAnnouncement;

  constructor(announcement: Announcement) {
    this.announcement = announcement;
  }
}

export function routeUpdateHackathon(event: WSEvent) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  const currentHackathon = store.getState().hackathon;

  switch (event.type) {
    case 'receive_hackathon_update':
      const payload = (event.payload as { hackathon: Hackathon }).hackathon;

      if (payload.id === currentHackathon.id) {
        store.dispatch(updateCurrentHackathon(payload));
      }
      break;

    default:
      break;
  }
}

export function routeNewHackathonAnnouncement(event: WSEvent, setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>) {
  if (event.type === undefined) {
    alert('No Type in the Event');
  }

  const currentHackathon = store.getState().hackathon;

  switch (event.type) {
    case 'receive_new_hackathon_announcement':
      const payload = (event.payload as { announcement: Announcement }).announcement;

      if (payload.hackathonID === currentHackathon.id) {
        setAnnouncements(prev => [payload, ...(prev || [])]);
      }
      break;

    default:
      break;
  }
}

export function sendEvent(eventName: string, payloadEvent: any, conn: WebSocket) {
  const event = new WSEvent(eventName, payloadEvent);

  try {
    conn.send(JSON.stringify(event));
  } catch (err) {
    if (process.env.NODE_ENV == 'development') {
      console.log(err);
      alert('Socket connection error: ' + eventName);
    }
  }
}
