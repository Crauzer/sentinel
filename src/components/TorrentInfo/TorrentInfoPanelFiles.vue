<template>
  <q-table
    row-key="path"
    :rows="torrent.files"
    :columns="columns"
    hide-pagination
  >
    <template v-slot:body="props">
      <q-tr :props="props" class="cursor-pointer">
        <q-td key="path" :props="props">
          {{ props.row.path }}
        </q-td>
        <q-td key="length" :props="props">
          {{ formatBytes(props.row.length) }}
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
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { QTable } from 'quasar';
import { formatBytes } from '../../../src-shared/utils';
import { defineComponent, computed, ref } from 'vue';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '../../store';
import TorrentsModule from '../../store/modules/torrents';

const columns: QTable['columns'] = [
  {
    name: 'path',
    required: true,
    label: 'Path',
    align: 'left',
    field: 'path',
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
    name: 'progress',
    required: true,
    label: 'Progress',
    align: 'left',
    field: 'progress',
    sortable: true,
  },
];

export default defineComponent({
  setup: function () {
    const store = useStore();
    const torrentsModule = getModule(TorrentsModule, store);

    return {
      torrent: computed(() => torrentsModule.selectedTorrent),
      columns,
    };
  },
  methods: {
    formatBytes(bytes: number) {
      return formatBytes(bytes);
    },
  },
});
</script>
