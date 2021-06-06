import { Torrent } from 'webtorrent';
import { RootState } from '..';
import { Module } from 'vuex';

const state: Torrent[] = [];

const torrentsModule: Module<Torrent[], RootState> = {
  namespaced: true,
  state,
};

export default torrentsModule;
