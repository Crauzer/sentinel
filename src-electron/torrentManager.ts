import WebTorrent, { Torrent } from 'webtorrent';
import globalConfig, { ConfigTorrent } from './globalConfig';
import { TorrentState, TorrentStatus } from '../src-shared/torrent';

export default class TorrentManager {
  client: WebTorrent.Instance;
  torrents: TorrentWrapper[] = [];

  constructor() {
    this.client = new WebTorrent();
  }

  addTorrent(path: string): Torrent {
    const torrent = this.client.add(path, {
      path: globalConfig.get('torrentSavePath'),
    });

    torrent.on('metadata', () => {
      this.cacheTorrentMetadata();
      torrentWrapper.requestNewState();
    });

    const torrentWrapper = new TorrentWrapper(torrent);
    this.torrents.push(torrentWrapper);

    return torrent;
  }

  pauseTorrent(pauseTorrent: TorrentWrapper) {
    pauseTorrent.isPaused = true;

    pauseTorrent.internalTorrent.pause();
    pauseTorrent.internalTorrent.destroy(
      {
        destroyStore: false,
      },
      (err) => console.error(err)
    );

    this.cacheTorrentMetadata();
  }
  resumeTorrent(resumeTorrent: TorrentWrapper) {
    resumeTorrent.isPaused = false;

    resumeTorrent.internalTorrent = this.client.add(
      resumeTorrent.internalTorrent.magnetURI,
      {
        path: globalConfig.get('torrentSavePath'),
      }
    );

    resumeTorrent.internalTorrent.on('infoHash', () => {
      this.cacheTorrentMetadata();
      resumeTorrent.requestNewState();
    });
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
  isPaused = false;
  state?: TorrentState;

  constructor(torrent: Torrent) {
    this.internalTorrent = torrent;

    this.internalTorrent.on('ready', () => this.getStateFromTorrent());
  }

  resume(manager: TorrentManager) {
    this.isPaused = false;

    if (
      manager.client.torrents.find(
        (torrent) => torrent.magnetURI == this.internalTorrent.magnetURI
      ) === undefined
    ) {
      this.internalTorrent = manager.addTorrent(this.internalTorrent.magnetURI);
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
