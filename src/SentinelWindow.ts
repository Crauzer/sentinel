import {
  WindowApi,
  WindowGlobalStatsApi,
  WindowTorrentApi,
} from '../src-shared/windowApis';

export default interface SentinelWindow extends Window {
  api: WindowApi;
  torrentApi: WindowTorrentApi;
  globalStatsApi: WindowGlobalStatsApi;
}
