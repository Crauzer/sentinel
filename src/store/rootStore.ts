import { createStore } from 'vuex';
import { Torrent } from 'webtorrent';
import torrents from './modules/torrents';

export interface RootState {
  isUiDisabled: boolean;
  selectedTorrent?: Torrent;
}

const rootStore = createStore<RootState>({
  state: {
    isUiDisabled: false,
  },
  modules: {
    torrents,
  },
  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: !!process.env.DEBUGGING,
});

export default rootStore;
