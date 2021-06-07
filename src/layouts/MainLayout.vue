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
            title="Torrents"
            :columns="torrentColumns"
            :rows="torrents"
            row-key="name"
            :hide-pagination="true"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props"> {{ props.row.name }} </q-td>
                <q-td key="downloadSpeed" :props="props">
                  {{ formatBytesPerSecond(props.row.downloadSpeed) }}
                </q-td>
                <q-td key="uploadSpeed" :props="props">
                  {{ formatBytesPerSecond(props.row.uploadSpeed) }}
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
                  </q-linear-progress>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script lang="ts">
import { QTable } from 'quasar';
import { defineComponent, computed } from 'vue';
import SentinelWindow from '../SentinelWindow';
import TorrentsModule, { TorrentState } from '../store/modules/torrents';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '../store';
import { formatBytesPerSecond } from '../utils';

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
    name: 'progress',
    required: true,
    label: 'Progress',
    align: 'left',
    field: 'progress',
    sortable: true,
  },
];

export default defineComponent({
  name: 'MainLayout',
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

    return {
      minimize,
      toggleMaximize,
      closeApp,
      openTorrentFile: () => torrentsModule.openTorrentFile(),
      torrentColumns,
      torrents: computed(() => torrentsModule.torrents),
    };
  },
  methods: {
    formatBytesPerSecond(bytes: number) {
      return formatBytesPerSecond(bytes);
    },
  },
});
</script>
