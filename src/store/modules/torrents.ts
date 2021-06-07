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
  seeds: number;
  peers: number;
  ratio: number;
  size: number;
}

@Module({
  name: 'torrents',
})
export default class TorrentsModule extends VuexModule {
  torrents: TorrentState[] = [];

  @Mutation
  addTorrent(torrent: TorrentState) {
    this.torrents.push(torrent);
  }

  @Mutation
  setTorrentStates(states: TorrentState[]) {
    this.torrents = states;
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
