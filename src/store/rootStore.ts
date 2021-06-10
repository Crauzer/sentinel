import { createStore } from 'vuex';
import torrents from './modules/torrents';
import globalStats from './modules/globalStats';

export interface RootState {
  isUiDisabled: boolean;
}

const rootStore = createStore<RootState>({
  state: {
    isUiDisabled: false,
  },
  modules: {
    torrents,
    globalStats,
  },
  // enable strict mode (adds overhead!)
  // for dev mode and --debug builds only
  strict: !!process.env.DEBUGGING,
});

export default rootStore;
