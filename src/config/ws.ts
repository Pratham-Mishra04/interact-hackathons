import { NewAnnouncementEvent, SetupHackathonEvent, WSEvent, routeNewHackathonAnnouncement, routeUpdateHackathon, sendEvent } from '@/helpers/ws';
import { Announcement } from '@/types';
import Cookies from 'js-cookie';
import { SOCKET_URL } from './routes';

class SocketService {
  private static instance: SocketService | null = null;
  private socket: WebSocket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  public connect(hackathonID: string, userID: string | undefined = Cookies.get('id')): void {
    if (!userID || userID === '') return;

    const token = Cookies.get('token');
    if (!token || token === '') return;

    if (this.socket) return;

    const connectToSocket = () => {
      this.socket = new WebSocket(`${SOCKET_URL}?userID=${userID}&token=${token}`);

      this.socket.addEventListener('open', event => {
        this.setupHackathon(hackathonID);
        this.setupUpdateHackathon();
      });

      this.socket.addEventListener('error', event => {
        setTimeout(connectToSocket, 5000); // retry after 5 seconds
        this.disconnect();
      });
    };

    connectToSocket();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public setupHackathon(hackathonID: string) {
    if (this.socket) {
      const outgoingEvent = new SetupHackathonEvent(hackathonID);
      sendEvent('hackathon_setup', outgoingEvent, this.socket);
    }
  }

  public sendNewAnnouncement(announcement: Announcement) {
    if (this.socket && announcement.content != '') {
      const outgoingMessageEvent = new NewAnnouncementEvent(announcement);
      sendEvent('send_new_hackathon_announcement', outgoingMessageEvent, this.socket);
    }
  }

  public setupUpdateHackathon() {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeUpdateHackathon(event);
      });
    }
  }

  public setupNewHackathonAnnouncement(setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>) {
    if (this.socket) {
      this.socket.addEventListener('message', function (evt) {
        const eventData = JSON.parse(evt.data);
        const event = new WSEvent(eventData.type, eventData.payload);
        routeNewHackathonAnnouncement(event, setAnnouncements);
      });
    }
  }
}
const socketService = SocketService.getInstance();
export default socketService;
