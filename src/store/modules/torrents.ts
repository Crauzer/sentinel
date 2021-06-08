import {
  VuexModule,
  Mutation,
  Action,
  Module,
  MutationAction,
} from 'vuex-module-decorators';
import SentinelWindow from '@/src/SentinelWindow';

declare let window: SentinelWindow;

export interface TorrentState {
  name: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  timeRemaining: number;
  received: number;
  downloaded: number;
  uploaded: number;
  ratio: number;
  length: number;
  numPeers: number;
  status: TorrentStatus;
}

export enum TorrentStatus {
  Idle = 'Idle',
  Paused = 'Paused',
  Downloading = 'Downloading',
  Finished = 'Finished',
}

@Module({
  name: 'torrents',
})
export default class TorrentsModule extends VuexModule {
  torrents: TorrentState[] = [];
  selectedTorrent: TorrentState | null = null;

  @Mutation
  addTorrent(torrent: TorrentState) {
    this.torrents.push(torrent);
  }

  @Mutation
  setTorrentStates(states: TorrentState[]) {
    this.torrents = states;
  }

  @Mutation
  setSelectedTorrent(selectedTorrent: TorrentState) {
    console.log(selectedTorrent);
    this.selectedTorrent = selectedTorrent;
  }

  @Action
  openTorrentFile() {
    window.torrentApi
      .openTorrentFile()
      .then((path) => {
        window.torrentApi
          .addTorrent(path)
          .then((torrent) => {
            this.addTorrent(torrent);
          })
          .catch((reason) => console.error(reason));
      })
      .catch((reason) => {
        console.error(reason);
      });

    return {};
  }
}
