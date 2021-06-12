<template>
  <div class="q-pa-md">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <q-bar class="q-electron-drag">
          <q-icon name="shield" />
          <div>Sentinel</div>

          <q-space />
          <div>
            D: {{ formatBytesPerSecond(globalStats.downloadSpeed) }} U:
            {{ formatBytesPerSecond(globalStats.uploadSpeed) }}
          </div>
          <q-space />

          <q-btn dense flat icon="minimize" @click="minimize" />
          <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
          <q-btn dense flat icon="close" @click="closeApp" />
        </q-bar>

        <div class="q-pa-sm q-pl-md row items-center">
          <div class="cursor-pointer non-selectable">
            File
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="openTorrentFile">
                  <q-item-section avatar>
                    <q-icon name="mdi-file" />
                  </q-item-section>
                  <q-item-section>Open Torrent File</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="isAddingMagnet = true">
                  <q-item-section avatar>
                    <q-icon name="mdi-magnet" />
                  </q-item-section>
                  <q-item-section>Add Torrent Magnet</q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="closeApp">
                  <q-item-section avatar>
                    <q-icon name="close" />
                  </q-item-section>
                  <q-item-section>Quit</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
      </q-header>

      <q-page-container>
        <q-page>
          <q-table
            row-key="name"
            :rows="torrents"
            :columns="torrentColumns"
            hide-pagination
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr
                :props="props"
                :class="{
                  'cursor-pointer': true,
                  torrentRowPaused: props.row.status == 'Paused',
                }"
                @click.native="onTorrentRowClick(props.row)"
              >
                <q-td auto-width>
                  <q-btn
                    size="sm"
                    color="primary"
                    round
                    dense
                    @click="props.expand = !props.expand"
                    :icon="props.expand ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  />
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="length" :props="props">
                  {{ formatBytes(props.row.length) }}
                </q-td>
                <q-td key="downloadSpeed" :props="props">
                  {{ formatBytesPerSecond(props.row.downloadSpeed) }}
                </q-td>
                <q-td key="uploadSpeed" :props="props">
                  {{ formatBytesPerSecond(props.row.uploadSpeed) }}
                </q-td>
                <q-td key="status" :props="props">
                  {{ props.row.status }}
                </q-td>
                <q-td key="timeRemaining" :props="props">
                  {{ formatTimeRemaining(props.row.timeRemaining) }}
                </q-td>
                <q-td key="progress" :props="props">
                  <q-linear-progress
                    v-if="props.row.progress > 0.0 && props.row.progress < 1.0"
                    size="25px"
                    :value="props.row.progress"
                    color="info"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge
                        color="dark"
                        text-color="white"
                        :label="(props.row.progress * 100).toFixed(2)"
                      />
                    </div>
                  </q-linear-progress>
                  <q-linear-progress
                    v-else-if="props.row.progress === 0.0"
                    size="25px"
                    :value="props.row.progress"
                    color="warning"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge
                        color="dark"
                        text-color="white"
                        :label="(props.row.progress * 100).toFixed(2)"
                      />
                    </div>
                  </q-linear-progress>
                  <q-linear-progress
                    v-else-if="props.row.progress === 1.0"
                    size="25px"
                    :value="props.row.progress"
                    color="positive"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge
                        color="dark"
                        text-color="white"
                        :label="(props.row.progress * 100).toFixed(2)"
                      />
                    </div>
                  </q-linear-progress>
                </q-td>
                <q-td key="numPeers" :props="props">
                  {{ props.row.numPeers }}
                </q-td>
                <q-menu context-menu touch-position>
                  <q-list dense style="min-width: 18rem">
                    <q-item
                      clickable
                      v-close-popup
                      v-if="props.row.status == `Paused`"
                      @click="onTorrentResume(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon color="primary" name="mdi-play" />
                      </q-item-section>
                      <q-item-section>Resume</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      v-if="props.row.status == `Downloading`"
                      @click="onTorrentPause(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon color="primary" name="pause" />
                      </q-item-section>
                      <q-item-section>Pause</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      v-close-popup
                      @click="onTorrentDelete(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon color="primary" name="delete" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item
                      clickable
                      v-close-popup
                      @click="onTorrentCopyMagnet(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon color="primary" name="mdi-magnet" />
                      </q-item-section>
                      <q-item-section>Copy Magnet</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-tr>
              <q-tr v-show="props.expand" :props="props">
                <q-td colspan="100%">
                  <q-card bordered>
                    <torrent-info-panel :torrent="props.row">
                    </torrent-info-panel>
                  </q-card>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data="{}"> </template>
          </q-table>
        </q-page>
      </q-page-container>

      <q-dialog v-model="isAddingMagnet">
        <q-card style="width: 700px; max-width: 80vw">
          <q-form @submit="onAddMagnetTorrent" class="q-gutter-md items-center">
            <q-input
              filled
              v-model="addedMagnetTorrent"
              label="Magnet Link"
              hint="Magnet link"
              lazy-rules
              :rules="[
                (val) =>
                  (val && val.length > 0) || 'Please enter a magnet link',
              ]"
            />

            <q-card-actions align="center">
              <q-btn label="Add" type="submit" color="primary" />
              <q-btn
                label="Close"
                type="reset"
                color="primary"
                @click="onAddMagnetTorrentClose"
                flat
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { QTable, useQuasar } from 'quasar';
import { defineComponent, computed, ref } from 'vue';
import SentinelWindow from '../SentinelWindow';
import TorrentsModule from '../store/modules/torrents';
import GlobalStatsModule from '../store/modules/globalStats';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '../store';
import { formatBytes, formatBytesPerSecond } from '../../src-shared/utils';
import TorrentInfoPanel from '../components/TorrentInfo/TorrentInfoPanel.vue';
import moment from 'moment';
import { TorrentState, TorrentStatus } from '../../src-shared/torrent';
import copy from 'copy-to-clipboard';

declare let window: SentinelWindow;

const torrentColumns: QTable['columns'] = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'length',
    required: true,
    label: 'Size',
    align: 'left',
    field: 'length',
    sortable: true,
  },
  {
    name: 'downloadSpeed',
    required: true,
    label: 'Download Speed',
    align: 'left',
    field: 'downloadSpeed',
    sortable: true,
  },
  {
    name: 'uploadSpeed',
    required: true,
    label: 'Upload Speed',
    align: 'left',
    field: 'uploadSpeed',
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: 'status',
    sortable: true,
  },
  {
    name: 'timeRemaining',
    required: true,
    label: 'ETA',
    align: 'left',
    field: 'timeRemaining',
    sortable: true,
  },
  {
    name: 'progress',
    required: true,
    label: 'Progress',
    align: 'left',
    field: 'progress',
    sortable: true,
  },
  {
    name: 'numPeers',
    required: true,
    label: 'Peers',
    align: 'left',
    field: 'numPeers',
    sortable: true,
  },
];

export default defineComponent({
  name: 'MainLayout',
  components: {
    TorrentInfoPanel,
  },
  data() {
    return {
      isAddingMagnet: false,
      addedMagnetTorrent: '',
    };
  },
  setup: function () {
    const store = useStore();
    const torrentsModule = getModule(TorrentsModule, store);
    const globalStatsModule = getModule(GlobalStatsModule, store);

    setInterval(() => {
      window.torrentApi
        .fetchTorrentStates()
        .then((states) => {
          torrentsModule.setTorrentStates(states);
        })
        .catch((reason) => console.error(reason));

      window.globalStatsApi
        .fetchGlobalStats()
        .then((globalStats) => {
          globalStatsModule.setDownloadSpeed(globalStats.downloadSpeed);
          globalStatsModule.setUploadSpeed(globalStats.uploadSpeed);
        })
        .catch((reason) => console.error(reason));
    }, 250);

    function minimize() {
      window.api.minimize();
    }

    function toggleMaximize() {
      window.api.toggleMaximize();
    }

    function closeApp() {
      window.api.close();
    }

    return {
      minimize,
      toggleMaximize,
      closeApp,
      openTorrentFile: () => torrentsModule.openTorrentFile(),
      torrentColumns,
    };
  },
  computed: {
    torrents() {
      const torrentsModule = getModule(TorrentsModule, this.$store);
      return torrentsModule.torrents;
    },
    globalStats() {
      const globalStatsModule = getModule(GlobalStatsModule, this.$store);

      return globalStatsModule;
    },
    selectedTorrent: {
      get: function () {
        const torrentsModule = getModule(TorrentsModule, this.$store);
        return torrentsModule.selectedTorrent;
      },
      set: function (value: TorrentState) {
        const torrentsModule = getModule(TorrentsModule, this.$store);
        torrentsModule.setSelectedTorrent(value);
      },
    },
  },
  methods: {
    formatBytes(bytes: number) {
      if (bytes === Number.NaN) {
        return '∞';
      } else {
        return formatBytes(bytes);
      }
    },
    formatBytesPerSecond(bytes: number) {
      if (bytes === Number.NaN) {
        return '∞';
      } else {
        return formatBytesPerSecond(bytes);
      }
    },
    formatTimeRemaining(status: TorrentStatus, seconds: number) {
      if (status !== TorrentStatus.Downloading) {
        return '∞';
      } else {
        return moment.duration(seconds, 'seconds').humanize(true);
      }
    },

    onTorrentRowClick(torrent: TorrentState) {
      this.selectedTorrent = torrent;
    },
    onTorrentCopyMagnet(torrent: TorrentState) {
      copy(torrent.magnet);

      const $q = useQuasar();

      $q.notify({
        message: 'Copied magnet',
        icon: 'mdi-magnet',
        timeout: 500,
      });
    },

    onAddMagnetTorrent() {
      const torrentsModule = getModule(TorrentsModule, this.$store);

      torrentsModule.addTorrent(this.addedMagnetTorrent);

      this.isAddingMagnet = false;
    },
    onAddMagnetTorrentClose() {
      this.isAddingMagnet = false;
    },

    async onTorrentResume(torrent: TorrentState) {
      const $q = useQuasar();

      await window.torrentApi.resumeTorrent(torrent.infoHash);

      $q.notify({
        message: 'Resumed ' + torrent.name,
        icon: 'mdi-play',
        timeout: 500,
      });
    },
    async onTorrentPause(torrent: TorrentState) {
      const $q = useQuasar();

      await window.torrentApi.pauseTorrent(torrent.infoHash);

      $q.notify({
        message: 'Paused ' + torrent.name,
        icon: 'mdi-pause',
        timeout: 500,
      });
    },
    async onTorrentDelete(torrent: TorrentState) {
      const $q = useQuasar();

      await window.torrentApi.deleteTorrent(torrent.infoHash);

      $q.notify({
        message: 'Deleted ' + torrent.name,
        icon: 'delete',
        timeout: 500,
      });
    },
  },
});
</script>
