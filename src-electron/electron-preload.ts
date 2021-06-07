import { TorrentState } from './ipcTypes';
import { Torrent } from 'webtorrent';
import { contextBridge, ipcRenderer } from 'electron';
import { BrowserWindow } from '@electron/remote';

contextBridge.exposeInMainWorld('api', {
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

contextBridge.exposeInMainWorld('torrentApi', {
  addTorrent: (path: string): Promise<TorrentState> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('addTorrent', {
          path,
        })
        .then((torrent: Torrent) => resolve(torrent))
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
  fetchTorrentStates: (): Promise<TorrentState[]> => {
    return new Promise((resolve, reject) => {
      ipcRenderer
        .invoke('fetchTorrentStates')
        .then((states: TorrentState[]) => resolve(states))
        .catch((reason) => reject(reason));
    });
  },
});