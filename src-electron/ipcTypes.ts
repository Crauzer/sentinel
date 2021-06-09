export interface TorrentState {
  name: string;
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
}

export enum TorrentStatus {
  Idle = 'Idle',
  Paused = 'Paused',
  Downloading = 'Downloading',
  Finished = 'Finished',
}
