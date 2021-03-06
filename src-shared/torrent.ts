export interface TorrentState {
  name: string;
  magnet: string;
  infoHash: string;
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
  announce: string[];
  files: TorrentFile[];
}

export enum TorrentStatus {
  Idle = 'Idle',
  Paused = 'Paused',
  Downloading = 'Downloading',
  Finished = 'Finished',
}

export interface TorrentFile {
  name: string;
  path: string;
  length: number;
  downloaded: number;
  progress: number;
}
