import { VuexModule, Mutation, Action, Module } from 'vuex-module-decorators';
import SentinelWindow from '@/src/SentinelWindow';
import { TorrentState } from '@/src-shared/torrent';

declare let window: SentinelWindow;

@Module({
  name: 'torrents',
})
export default class TorrentsModule extends VuexModule {
  torrents: TorrentState[] = [];
  selectedTorrent: TorrentState | null = null;

  @Mutation
  ADD_TORRENT(torrent: TorrentState) {
    this.torrents = [...this.torrents, torrent];
  }

  @Mutation
  SET_TORRENT_STATES(states: TorrentState[]) {
    this.torrents = states;

    if (this.selectedTorrent) {
      const matchingTorrent = this.torrents.find(
        (torrent) => torrent.infoHash == this.selectedTorrent?.infoHash
      );

      if (matchingTorrent) {
        this.selectedTorrent = matchingTorrent;
      } else {
        this.selectedTorrent = null;
      }
    }
  }

  @Mutation
  SET_SELECTED_TORRENT(selectedTorrent: TorrentState | null) {
    this.selectedTorrent = selectedTorrent;
  }

  @Action
  addTorrent(torrent: TorrentState) {
    this.ADD_TORRENT(torrent);
  }

  @Action
  setTorrentStates(states: TorrentState[]) {
    this.SET_TORRENT_STATES(states);
  }

  @Action
  setSelectedTorrent(selectedTorrent: TorrentState | null) {
    this.SET_SELECTED_TORRENT(selectedTorrent);
  }

  @Action
  openTorrentFile() {
    window.torrentApi
      .openTorrentFile()
      .then((path) => {
        if (path) {
          window.torrentApi
            .addTorrent(path)
            .then((torrent) => {
              this.ADD_TORRENT(torrent);
            })
            .catch((reason) => console.error(reason));
        }
      })
      .catch((reason) => {
        console.error(reason);
      });

    return {};
  }
}
