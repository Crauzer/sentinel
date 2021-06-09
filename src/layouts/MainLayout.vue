<template>
  <div class="q-pa-md">
    <q-layout view="lHh lpr lFf">
      <q-header elevated>
        <q-bar class="q-electron-drag">
          <q-icon name="shield" />
          <div>Sentinel</div>

          <q-space />

          <q-btn dense flat icon="minimize" @click="minimize" />
          <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
          <q-btn dense flat icon="close" @click="closeApp" />
        </q-bar>

        <div class="q-pa-sm q-pl-md row items-center">
          <div class="cursor-pointer non-selectable">
            File
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup @click="openTorrentFile">
                  <q-item-section>Open Torrent File</q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="closeApp">
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
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="cursor-pointer"
                @click.native="onTorrentRowClick(props.row)"
              >
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
                        <q-icon color="primary" name="play" />
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
                  </q-list>
                </q-menu>
              </q-tr>
            </template>
          </q-table>
        </q-page>
      </q-page-container>

      <q-footer elevated bordered class="bg-dark">
        <torrent-info-panel> </torrent-info-panel>
      </q-footer>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { QTable } from 'quasar';
import { defineComponent, computed, ref } from 'vue';
import SentinelWindow from '../SentinelWindow';
import TorrentsModule, { TorrentState } from '../store/modules/torrents';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '../store';
import { formatBytes, formatBytesPerSecond } from '../utils';
import TorrentInfoPanel from '../components/TorrentInfoPanel.vue';
import moment from 'moment';

declare let window: SentinelWindow;

const torrentColumns: QTable['columns'] = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: (row: TorrentState) => row.name,
    format: (value: string) => `${value}`,
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
  setup: function () {
    const store = useStore();
    const torrentsModule = getModule(TorrentsModule, store);

    setInterval(() => {
      window.torrentApi
        .fetchTorrentStates()
        .then((states) => {
          torrentsModule.setTorrentStates(states);
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

    function onTorrentRowClick(row: TorrentState) {
      torrentsModule.setSelectedTorrent(row);
    }

    return {
      minimize,
      toggleMaximize,
      closeApp,
      openTorrentFile: () => torrentsModule.openTorrentFile(),
      onTorrentRowClick,
      torrentsInfoSplitterModel: ref(50),
      torrentColumns,
      torrents: computed(() => torrentsModule.torrents),
      selectedTorrent: computed(() => torrentsModule.selectedTorrent),
    };
  },
  methods: {
    formatBytes(bytes: number) {
      return formatBytes(bytes);
    },
    formatBytesPerSecond(bytes: number) {
      return formatBytesPerSecond(bytes);
    },
    formatTimeRemaining(seconds: number) {
      return moment.duration(seconds, 'seconds').humanize(true);
    },

    async onTorrentResume(torrent: TorrentState) {
      await window.torrentApi.resumeTorrent(torrent.infoHash);
    },
    async onTorrentPause(torrent: TorrentState) {
      await window.torrentApi.pauseTorrent(torrent.infoHash);
    },
    async onTorrentDelete(torrent: TorrentState) {
      await window.torrentApi.deleteTorrent(torrent.infoHash);
    },
  },
});
</script>
