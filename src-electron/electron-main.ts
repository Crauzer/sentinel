import GlobalStats from '../src-shared/globalStats';
import { app, BrowserWindow, nativeTheme, ipcMain, dialog } from 'electron';
import path from 'path';
import TorrentManager, { TorrentWrapper } from './torrentManager';
import globalConfig from './globalConfig';
import { TorrentState } from '@/src-shared/torrent';
import { formatBytesPerSecond } from '../src-shared/utils';

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
const torrentManager = new TorrentManager();

initializeConfig();

function initializeConfig() {
  // Load torrents
  const configTorrents = globalConfig.get('torrents');
  for (const configTorrent of configTorrents) {
    if (configTorrent) {
      torrentManager
        .addTorrent(configTorrent.path)
        .then((torrent) => {
          if (configTorrent.isPaused) {
            torrent.on('ready', () => {
              torrentManager.pauseTorrent(new TorrentWrapper(torrent));
            });
          }
        })
        .catch((reason) => console.error(reason));
    }
  }
}

function createWindow() {
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

  // Load content
  mainWindow?.loadURL(process.env.APP_URL ?? '');

  // Dev Tools
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

ipcMain.handle('addTorrent', async (event, { path }) => {
  await torrentManager.addTorrent(path);
});

ipcMain.handle('resumeTorrent', (event, { infoHash }) => {
  const pausedTorrent = torrentManager.torrents.find(
    (torrent) => torrent.internalTorrent.infoHash === infoHash
  );
  if (pausedTorrent) {
    torrentManager.resumeTorrent(pausedTorrent);
  }
});

ipcMain.handle('pauseTorrent', (event, { infoHash }) => {
  const torrent = torrentManager.torrents.find(
    (torrent) => torrent.internalTorrent.infoHash === infoHash
  );

  if (torrent) {
    torrentManager.pauseTorrent(torrent);
  }
});

ipcMain.handle('deleteTorrent', (event, { infoHash }) => {
  const torrent = torrentManager.torrents.find(
    (torrent) => torrent.internalTorrent.infoHash === infoHash
  );

  if (torrent) {
    torrentManager.deleteTorrent(torrent);
  }
});

ipcMain.handle('fetchTorrentStates', (): TorrentState[] => {
  return torrentManager.torrents
    .filter((torrent) => {
      torrent.requestNewState();
      return torrent.state;
    })
    .map((torrent) => torrent.state as TorrentState);
});

ipcMain.handle('fetchGlobalStats', (): GlobalStats => {
  mainWindow?.setTitle(
    `[D: ${formatBytesPerSecond(
      torrentManager.client.downloadSpeed
    )} | U: ${formatBytesPerSecond(
      torrentManager.client.uploadSpeed
    )}] Sentinel`
  );

  return {
    downloadSpeed: torrentManager.client.downloadSpeed,
    uploadSpeed: torrentManager.client.uploadSpeed,
  };
});
