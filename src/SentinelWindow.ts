import { TorrentState } from '@/src-shared/torrent';
import { Torrent } from 'webtorrent';

export interface WindowApi {
  send: (channel: string, ...arg: any) => void;
  receive: (channel: string, func: (event: any, ...arg: any) => void) => void;
  electronIpcSendTo: (window_id: string, channel: string, ...arg: any) => void;
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
  addTorrent: (path: string) => Promise<TorrentState>;
  openTorrentFile: () => Promise<string | undefined>;

  resumeTorrent: (infoHash: string) => Promise<void>;
  pauseTorrent: (infoHash: string) => Promise<void>;
  deleteTorrent: (infoHash: string) => Promise<void>;

  fetchTorrentStates: () => Promise<TorrentState[]>;
}

export default interface SentinelWindow extends Window {
  api: WindowApi;
  torrentApi: WindowTorrentApi;
}
