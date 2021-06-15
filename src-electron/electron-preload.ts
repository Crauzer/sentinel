import { contextBridge, ipcRenderer } from 'electron';
import { BrowserWindow } from '@electron/remote';
import { TorrentState } from '../src-shared/torrent';
import GlobalStats from '../src-shared/globalStats';
import {
  WindowApi,
  WindowGlobalStatsApi,
  WindowTorrentApi,
} from '../src-shared/windowApis';

declare module 'electron' {
  interface ContextBridge {
    exposeInMainWorld<A>(apiKey: string, api: A): void;
  }
}

contextBridge.exposeInMainWorld<WindowApi>('api', {
  send: <D>(channel: string, data: D) => {
    ipcRenderer.invoke(channel, data).catch((e) => console.log(e));
  },
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  electronIpcSendTo: (
    webContentsId: number,
    channel: string,
    ...arg: unknown[]
  ) => {
    ipcRenderer.sendTo(webContentsId, channel, arg);
  },
  electronIpcSend: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, args);
  },
  electronIpcSendSync: <R>(channel: string, ...args: any[]) => {
    return ipcRenderer.sendSync(channel, args) as R;
  },
  electronIpcOn: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.on(channel, listener);
  },
  electronIpcOnce: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.once(channel, listener);
  },
  electronIpcRemoveListener: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.removeListener(channel, listener);
  },
  electronIpcRemoveAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize();
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  },

  close() {
    BrowserWindow.getFocusedWindow()?.close();
  },
});

contextBridge.exposeInMainWorld<WindowTorrentApi>('torrentApi', {
  addTorrent: (path: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('addTorrent', {
          path,
        })
        .then(() => resolve())
        .catch((reason) => reject(reason));
    });
  },
  openTorrentFile: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('openAddTorrentDialog')
        .then((path: string) => resolve(path))
        .catch((reason) => {
          reject(reason);
        });
    });
  },

  resumeTorrent: (infoHash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('resumeTorrent', { infoHash })
        .then(() => resolve())
        .catch((reason) => reject(reason));
    });
  },
  pauseTorrent: (infoHash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('pauseTorrent', { infoHash })
        .then(() => resolve())
        .catch((reason) => reject(reason));
    });
  },
  deleteTorrent: (infoHash: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('deleteTorrent', { infoHash })
        .then(() => resolve())
        .catch((reason) => reject(reason));
    });
  },

  fetchTorrentStates: (): Promise<TorrentState[]> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('fetchTorrentStates')
        .then((states: TorrentState[]) => resolve(states))
        .catch((reason) => reject(reason));
    });
  },
});

contextBridge.exposeInMainWorld<WindowGlobalStatsApi>('globalStatsApi', {
  fetchGlobalStats(): Promise<GlobalStats> {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('fetchGlobalStats')
        .then((globalStats: GlobalStats) => resolve(globalStats))
        .catch((reason) => reject(reason));
    });
  },
});
