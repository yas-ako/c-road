<template>
  <svg
    class="board-svg"
    :viewBox="`0 0 ${SVG_BOARD_SIZE} ${SVG_BOARD_SIZE}`"
    role="img"
    aria-label="C*-roadの盤面"
  >
    <rect class="board-background" width="100%" height="100%" />

    <g class="board-grid" shape-rendering="crispEdges">
      <rect
        :x="BOARD_GEOMETRY.gridWidth / 2"
        :y="BOARD_GEOMETRY.gridWidth / 2"
        :width="SVG_BOARD_SIZE - BOARD_GEOMETRY.gridWidth"
        :height="SVG_BOARD_SIZE - BOARD_GEOMETRY.gridWidth"
        :stroke-width="BOARD_GEOMETRY.gridWidth"
      />
      <template v-for="index in DISPLAY_BOARD_SIZE - 1" :key="index">
        <line
          :x1="index * BOARD_GEOMETRY.cellSize"
          y1="0"
          :x2="index * BOARD_GEOMETRY.cellSize"
          :y2="SVG_BOARD_SIZE"
          :stroke-width="BOARD_GEOMETRY.gridWidth"
        />
        <line
          x1="0"
          :y1="index * BOARD_GEOMETRY.cellSize"
          :x2="SVG_BOARD_SIZE"
          :y2="index * BOARD_GEOMETRY.cellSize"
          :stroke-width="BOARD_GEOMETRY.gridWidth"
        />
      </template>
    </g>

    <g class="board-connections">
      <line
        v-for="connection in model.connections"
        :key="connection.key"
        :x1="connection.from.x"
        :y1="connection.from.y"
        :x2="connection.to.x"
        :y2="connection.to.y"
        :stroke-width="BOARD_GEOMETRY.connectionWidth"
        :class="[
          `connection--${connection.color}`,
          `render--${connection.emphasis}`,
        ]"
      />
    </g>

    <g class="board-roads">
      <g
        v-for="road in model.roads"
        :key="road.key"
        :class="`render--${road.emphasis}`"
      >
        <rect
          :x="
            road.displayCoordinate.x * BOARD_GEOMETRY.cellSize +
            BOARD_GEOMETRY.roadInset
          "
          :y="
            road.displayCoordinate.y * BOARD_GEOMETRY.cellSize +
            BOARD_GEOMETRY.roadInset
          "
          :width="BOARD_GEOMETRY.cellSize - BOARD_GEOMETRY.roadInset * 2"
          :height="BOARD_GEOMETRY.cellSize - BOARD_GEOMETRY.roadInset * 2"
          :stroke-width="BOARD_GEOMETRY.roadBorderWidth"
          :class="[
            'road-shape',
            `road-shape--${road.color}`,
            `road-shape--${road.emphasis}`,
          ]"
        />
        <text
          :x="(road.displayCoordinate.x + 0.5) * BOARD_GEOMETRY.cellSize"
          :y="(road.displayCoordinate.y + 0.5) * BOARD_GEOMETRY.cellSize"
          :font-size="BOARD_GEOMETRY.roadNumberSize"
          text-anchor="middle"
          dominant-baseline="central"
          :class="[
            'road-number',
            `road-number--${road.color}`,
            `road-number--${road.emphasis}`,
          ]"
        >
          {{ road.level }}
        </text>
      </g>
    </g>

    <g class="board-towns">
      <rect
        v-for="town in model.towns"
        :key="town.townId"
        :x="town.x + BOARD_GEOMETRY.townInset"
        :y="town.y + BOARD_GEOMETRY.townInset"
        :width="town.width - BOARD_GEOMETRY.townInset * 2"
        :height="town.height - BOARD_GEOMETRY.townInset * 2"
        :stroke-width="BOARD_GEOMETRY.townBorderWidth"
        class="town-shape"
      />
    </g>

    <g class="board-markers">
      <rect
        v-for="marker in cellMarkers"
        :key="marker.key"
        :x="
          marker.displayCoordinate.x * BOARD_GEOMETRY.cellSize +
          BOARD_GEOMETRY.roadInset
        "
        :y="
          marker.displayCoordinate.y * BOARD_GEOMETRY.cellSize +
          BOARD_GEOMETRY.roadInset
        "
        :width="BOARD_GEOMETRY.cellSize - BOARD_GEOMETRY.roadInset * 2"
        :height="BOARD_GEOMETRY.cellSize - BOARD_GEOMETRY.roadInset * 2"
        :stroke-width="BOARD_GEOMETRY.roadBorderWidth"
        :class="[
          `marker--${marker.kind}`,
          marker.color === undefined ? undefined : `marker--${marker.color}`,
        ]"
      />
    </g>

    <g class="board-edge-mask">
      <rect
        v-for="marker in edgeMarkers"
        :key="marker.key"
        :x="marker.displayCoordinate.x * BOARD_GEOMETRY.cellSize"
        :y="marker.displayCoordinate.y * BOARD_GEOMETRY.cellSize"
        :width="BOARD_GEOMETRY.cellSize"
        :height="BOARD_GEOMETRY.cellSize"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  import {
    BOARD_GEOMETRY,
    SVG_BOARD_SIZE,
  } from "~/components/board/rendering/geometry";
  import type { BoardRenderModel } from "~/components/board/rendering/types";
  import { DISPLAY_BOARD_SIZE } from "~/game/types";

  const props = defineProps<{
    model: BoardRenderModel;
  }>();

  const cellMarkers = computed(() =>
    props.model.markers.filter(({ kind }) => kind !== "display-edge"),
  );
  const edgeMarkers = computed(() =>
    props.model.markers.filter(({ kind }) => kind === "display-edge"),
  );
</script>

<style scoped>
  :global(:root) {
    --blue-color-dark: #1e3a8a;
    --blue-color-light: #8ba0d8;
    --red-color-dark: #8a2b1e;
    --red-color-light: #f5a89e;
  }

  .board-svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .board-background {
    fill: #e7e7e7;
  }

  .board-connections line {
    stroke-linecap: butt;
  }

  .connection--blue {
    stroke: var(--blue-color-dark);
  }

  .connection--red {
    stroke: var(--red-color-dark);
  }

  .road-shape {
    stroke-linejoin: miter;
  }

  .road-shape--blue {
    fill: var(--blue-color-light);
    stroke: var(--blue-color-dark);
  }

  .road-shape--red {
    fill: var(--red-color-light);
    stroke: var(--red-color-dark);
  }

  .road-shape--blue.road-shape--winning {
    fill: var(--blue-color-dark);
  }

  .road-shape--red.road-shape--winning {
    fill: var(--red-color-dark);
  }

  .road-number {
    font-family: inherit;
    font-weight: 400;
    pointer-events: none;
  }

  .road-number--blue {
    fill: var(--blue-color-dark);
  }

  .road-number--red {
    fill: var(--red-color-dark);
  }

  .road-number--winning {
    fill: white;
    font-weight: 700;
  }

  .render--muted {
    opacity: 0.38;
  }

  .town-shape {
    fill: rgb(156 163 175);
    stroke: rgb(75 85 99);
  }

  .marker--selection {
    fill: transparent;
  }

  .marker--selection.marker--blue {
    stroke: var(--blue-color-light);
  }

  .marker--selection.marker--red {
    stroke: var(--red-color-light);
  }

  .marker--town-candidate {
    fill: rgb(229 231 235);
    stroke: rgb(156 163 175);
  }

  .board-edge-mask rect {
    fill: white;
    opacity: 0.6;
  }

  .board-grid line,
  .board-grid rect {
    fill: none;
    stroke: white;
  }
</style>
