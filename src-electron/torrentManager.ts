import WebTorrent, { Torrent, Wire } from 'webtorrent';
import globalConfig, { ConfigTorrent } from './globalConfig';
import { TorrentState, TorrentStatus } from '../src-shared/torrent';

declare module 'webtorrent' {
  interface Torrent {
    wires: Wire[];
  }

  interface Wire {}
}

export default class TorrentManager {
  client: WebTorrent.Instance;
  torrents: TorrentWrapper[] = [];

  constructor() {
    this.client = new WebTorrent();
  }

  addTorrent(path: string): Promise<Torrent> {
    return new Promise((resolve, reject) => {
      if (
        !this.client.torrents.find(
          (torrent) => torrent.path === path || torrent.magnetURI === path
        )
      ) {
        const torrent = this.client.add(path, {
          path: globalConfig.get('torrentSavePath'),
        });

        torrent.on('infoHash', () => {
          const torrentWrapper = new TorrentWrapper(torrent);
          this.torrents.push(torrentWrapper);

          this.cacheTorrentMetadata();
          torrentWrapper.requestNewState();

          resolve(torrent);
        });
      } else {
        reject();
      }
    });
  }

  pauseTorrent(pauseTorrent: TorrentWrapper) {
    pauseTorrent.isPaused = true;

    pauseTorrent.pausedWires = pauseTorrent.internalTorrent.wires;
    pauseTorrent.internalTorrent.wires = [];

    pauseTorrent.internalTorrent.pause();

    this.cacheTorrentMetadata();
  }
  resumeTorrent(resumeTorrent: TorrentWrapper) {
    resumeTorrent.isPaused = false;

    resumeTorrent.internalTorrent.wires = resumeTorrent.pausedWires;
    resumeTorrent.pausedWires = [];
    resumeTorrent.internalTorrent.resume();

    this.cacheTorrentMetadata();
  }

  deleteTorrent(deleteTorrent: TorrentWrapper) {
    this.torrents = this.torrents.filter(
      (torrent) =>
        torrent.internalTorrent.infoHash !=
        deleteTorrent.internalTorrent.infoHash
    );

    deleteTorrent.internalTorrent.destroy({
      destroyStore: true,
    });

    this.cacheTorrentMetadata();
  }
  removeTorrent(removeTorrent: TorrentWrapper) {
    this.torrents = this.torrents.filter(
      (torrent) =>
        torrent.internalTorrent.infoHash !=
        removeTorrent.internalTorrent.infoHash
    );

    removeTorrent.internalTorrent.destroy({
      destroyStore: false,
    });

    this.cacheTorrentMetadata();
  }

  cacheTorrentMetadata() {
    const configTorrents: ConfigTorrent[] = this.torrents.map((torrent) => {
      return {
        path: torrent.internalTorrent.magnetURI,
        isPaused: torrent.isPaused,
      };
    });

    globalConfig.set('torrents', configTorrents);
  }
}

export class TorrentWrapper {
  internalTorrent: Torrent;
  state?: TorrentState;
  isPaused = false;
  pausedWires: Wire[] = [];

  constructor(torrent: Torrent) {
    this.internalTorrent = torrent;

    this.internalTorrent.on('ready', () => this.getStateFromTorrent());
  }

  async resume(manager: TorrentManager) {
    this.isPaused = false;

    if (
      !manager.client.torrents.find(
        (torrent) => torrent.magnetURI == this.internalTorrent.magnetURI
      )
    ) {
      this.internalTorrent = await manager.addTorrent(
        this.internalTorrent.magnetURI
      );
    }

    manager.cacheTorrentMetadata();
  }

  requestNewState() {
    this.getStateFromTorrent();
  }

  private getStateFromTorrent() {
    let status = TorrentStatus.Idle;
    if (this.internalTorrent.paused) {
      status = TorrentStatus.Paused;
    } else {
      status = TorrentStatus.Downloading;
    }

    if (this.internalTorrent.done) {
      status = TorrentStatus.Finished;
    }

    this.state = {
      name: this.internalTorrent.name,
      magnet: this.internalTorrent.magnetURI,
      infoHash: this.internalTorrent.infoHash,
      progress: this.internalTorrent.progress,
      downloadSpeed: this.internalTorrent.downloadSpeed,
      uploadSpeed: this.internalTorrent.uploadSpeed,
      timeRemaining:
        (this.internalTorrent.length - this.internalTorrent.downloaded) /
        this.internalTorrent.downloadSpeed,
      received: this.internalTorrent.received,
      downloaded: this.internalTorrent.downloaded,
      uploaded: this.internalTorrent.uploaded,
      ratio: this.internalTorrent.ratio,
      length: this.internalTorrent.length,
      numPeers: this.internalTorrent.numPeers,
      status,
      announce: this.internalTorrent.announce,
      files: this.internalTorrent.files.map((file) => {
        return {
          name: file.name,
          path: file.path,
          length: file.length,
          downloaded: file.downloaded,
          progress: file.progress,
        };
      }),
    };
  }
}
