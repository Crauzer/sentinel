import { app, BrowserWindow, nativeTheme, ipcMain, dialog } from 'electron';
import path from 'path';

import WebTorrent from 'webtorrent';
import { TorrentState, TorrentStatus } from './ipcTypes';
import Store from 'electron-store';

require('@electron/remote/main').initialize();

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(app.getPath('userData'), 'DevTools Extensions')
    );
  }
} catch (_) {}

let mainWindow: BrowserWindow | null;
const torrentClient = new WebTorrent();

const config = new Store<{
  torrents: string[];
}>({
  defaults: {
    torrents: [],
  },
});
const torrentSavePath = 'C:/sentinel';

initializeConfig();

function initializeConfig() {
  // Load torrents
  const torrents = config.get('torrents') as string[];
  for (const torrent of torrents) {
    torrentClient.add(torrent, { path: torrentSavePath });
  }
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        __dirname,
        process.env.QUASAR_ELECTRON_PRELOAD ?? ''
      ),
    },
  });

  mainWindow?.loadURL(process.env.APP_URL ?? '');

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// --------- IPC HANDLERS --------- \\

ipcMain.handle('openAddTorrentDialog', () => {
  const filePaths = mainWindow
    ? dialog.showOpenDialogSync(mainWindow, {
        title: 'Open Torrent file',
        defaultPath: '/',
        filters: [
          {
            name: 'Torrent files',
            extensions: ['torrent'],
          },
        ],
      })
    : undefined;

  return filePaths ? filePaths[0] : undefined;
});

ipcMain.handle('addTorrent', (event, { path }) => {
  torrentClient.add(
    path,
    {
      path: config.get('torrentSavePath') as string,
    },
    (torrent) => {
      config.set('torrents', [
        ...(config.get('torrents') as string[]),
        torrent.magnetURI,
      ]);
    }
  );
});

ipcMain.handle('fetchTorrentStates', (event): TorrentState[] => {
  return torrentClient.torrents.map((torrent): TorrentState => {
    let status = TorrentStatus.Idle;
    if (torrent.paused) {
      status = TorrentStatus.Paused;
    } else {
      status = TorrentStatus.Downloading;
    }

    if (torrent.done) {
      status = TorrentStatus.Finished;
    }

    return {
      name: torrent.name,
      progress: torrent.progress,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      timeRemaining:
        (torrent.length - torrent.downloaded) / torrent.downloadSpeed,
      received: torrent.received,
      downloaded: torrent.downloaded,
      uploaded: torrent.uploaded,
      ratio: torrent.ratio,
      length: torrent.length,
      numPeers: torrent.numPeers,
      status,
    };
  });
});
