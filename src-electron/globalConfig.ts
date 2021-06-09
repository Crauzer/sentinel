import Store from 'electron-store';

export interface ConfigTorrent {
  path: string;
  isPaused: boolean;
}

const config = new Store<{
  torrents: ConfigTorrent[];
}>({
  defaults: {
    torrents: [],
  },
});

export default config;
