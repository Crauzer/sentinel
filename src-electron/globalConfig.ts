import Store from 'electron-store';

export interface ConfigTorrent {
  path: string;
  isPaused: boolean;
}

const config = new Store<{
  torrents: ConfigTorrent[];
  torrentSavePath: string;
}>({
  defaults: {
    torrents: [],
    torrentSavePath: 'C:/sentinel',
  },
});

export default config;
