<template>
  <div class="column justify-start" v-if="torrent">
    <q-tab-panels v-model="tab">
      <q-tab-panel name="general">
        <h6 v-text="torrent.name"></h6>
      </q-tab-panel>
      <q-tab-panel name="trackers">
        <q-list bordered separator>
          <q-item v-for="tracker in torrent.announce" :key="tracker">
            <q-item-section>
              {{ tracker }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
      <q-tab-panel name="files">
        <torrent-info-panel-files key="files" />
      </q-tab-panel>
    </q-tab-panels>

    <q-separator />

    <q-tabs
      v-model="tab"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      dense
    >
      <q-tab name="general" label="General" />
      <q-tab name="trackers" label="Trackers" />
      <q-tab name="files" label="Files" />
    </q-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import TorrentInfoPanelFiles from './TorrentInfoPanelFiles.vue';
import { TorrentState } from '../../../src-shared/torrent';

export default defineComponent({
  components: { TorrentInfoPanelFiles },
  props: {
    torrent: {
      type: Object as PropType<TorrentState | null>,
      required: true,
    },
  },
  setup: function (props) {
    console.log(props);
    return {
      tab: ref('general'),
    };
  },
});
</script>
