<template>
  <div class="town-layer" aria-hidden="true">
    <div
      v-for="town in towns"
      :key="town.townId"
      class="town-shape"
      :style="{
        gridColumn: `${town.column} / span ${town.columnSpan}`,
        gridRow: `${town.row} / span ${town.rowSpan}`,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { getTownOverlays } from "~/components/board/townOverlay";
  import { useGameStore } from "~/stores/game";

  const game = useGameStore();
  const towns = computed(() => getTownOverlays(game.state.board));
</script>

<style scoped>
  .town-layer {
    position: absolute;
    z-index: 20;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(15, minmax(0, 1fr));
    grid-template-rows: repeat(15, minmax(0, 1fr));
    pointer-events: none;
  }

  .town-shape {
    margin: calc(100cqi / 180);
    border: min(0.5vmin, 2.5px) solid rgb(75 85 99);
    background: rgb(156 163 175);
  }
</style>
