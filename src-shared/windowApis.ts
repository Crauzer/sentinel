import GlobalStats from './globalStats';
import { TorrentState } from './torrent';

export interface WindowApi {
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
  electronIpcSendTo: (
    webContentsId: number,
    channel: string,
    ...arg: any
  ) => void;
  electronIpcSend: (channel: string, ...arg: any) => void;
  electronIpcOn: (
    channel: string,
    listener: (event: any, ...arg: any) => void
  ) => void;
  electronIpcSendSync: (channel: string, ...arg: any) => void;
  electronIpcOnce: (
    channel: string,
    listener: (event: any, ...arg: any) => void
  ) => void;
  electronIpcRemoveListener: (
    channel: string,
    listener: (event: any, ...arg: any) => void
  ) => void;
  electronIpcRemoveAllListeners: (channel: string) => void;

  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
}

export interface WindowTorrentApi {
  addTorrent: (path: string) => Promise<void>;
  openTorrentFile: () => Promise<string | undefined>;

  resumeTorrent: (infoHash: string) => Promise<void>;
  pauseTorrent: (infoHash: string) => Promise<void>;
  deleteTorrent: (infoHash: string) => Promise<void>;

  fetchTorrentStates: () => Promise<TorrentState[]>;
}

export interface WindowGlobalStatsApi {
  fetchGlobalStats: () => Promise<GlobalStats>;
}
