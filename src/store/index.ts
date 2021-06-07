import { Store } from 'redux';
import { InjectionKey } from 'vue';
import { Store as VuexStore, useStore as vuexUseStore } from 'vuex';
import rootStore, { RootState } from './rootStore';

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<RootState>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<Store<RootState>> = Symbol('vuex-key');

export default (function (/* { ssrContext } */) {
  return rootStore;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
