import { VuexModule, Mutation, Action, Module } from 'vuex-module-decorators';

@Module({
  name: 'globalStats',
})
export default class GlobalStats extends VuexModule {
  downloadSpeed = 0;
  uploadSpeed = 0;

  @Mutation
  SET_DOWNLOAD_SPEED(downloadSpeed: number) {
    this.downloadSpeed = downloadSpeed;
  }

  @Mutation
  SET_UPLOAD_SPEED(uploadSpeed: number) {
    this.uploadSpeed = uploadSpeed;
  }

  @Action
  setDownloadSpeed(downloadSpeed: number) {
    this.SET_DOWNLOAD_SPEED(downloadSpeed);
  }

  @Action
  setUploadSpeed(uploadSpeed: number) {
    this.SET_UPLOAD_SPEED(uploadSpeed);
  }
}
