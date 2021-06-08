<template>
  <div class="column justify-start" v-if="torrent !== null">
    <h6 v-text="torrent?.name"></h6>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { getModule } from 'vuex-module-decorators';
import { useStore } from '../store';
import TorrentsModule, { TorrentState } from '../store/modules/torrents';

export default defineComponent({
  setup: function () {
    const store = useStore();
    const torrentsModule = getModule(TorrentsModule, store);

    return {
      torrent: computed(() => torrentsModule.selectedTorrent),
    };
  },
});
</script>
