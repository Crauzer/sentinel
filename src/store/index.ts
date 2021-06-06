import { store } from 'quasar/wrappers';
import { InjectionKey } from 'vue';
import {
  createStore,
  Store as VuexStore,
  useStore as vuexUseStore,
  Payload,
} from 'vuex';
import { Torrent } from 'webtorrent';
import torrentsModule from './modules/torrents';

export interface RootState {
  isUiDisabled: boolean;
  selectedTorrent?: Torrent;
}

export interface AddTorrentPayload {
  path: string;
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<RootState>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<RootState>> = Symbol('vuex-key');

export default store(function (/* { ssrContext } */) {
  const Store = createStore<RootState>({
    state: {
      isUiDisabled: false,
    },
    modules: {
      torrents: torrentsModule,
    },
    actions: {
      addTorrent({ commit, state }, payload: AddTorrentPayload) {},
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING,
  });

  return Store;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
