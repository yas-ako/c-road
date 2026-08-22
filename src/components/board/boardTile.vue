<template>
  <!-- タップできるが見えない枠 -->
  <div
    class="relative flex h-full w-full select-none"
    :class="{ 'border-gray-200 text-slate-200': isInEdge(tileProps.number) }"
    @click="clickTile"
  >
    <!-- 背景色が青と赤に変わる部分 -->
    <div
      class="z-10 mx-auto my-auto flex h-5/6 w-5/6 cursor-grab border-[min(0.5vmin,2.5px)]"
      :class="cellColor"
    >
      <!-- 数字 -->
      <div class="z-5 mx-auto my-auto text-[min(4.2vmin,27px)]">
        {{ roadLevel }}
      </div>
    </div>
    <!-- まわりに伸びる道(8本用意する, 4は無し) -->
    <template v-for="i in [0, 1, 2, 3, 5, 6, 7, 8]" :key="i">
      <div
        v-if="nextCells[i]"
        class="absolute z-0 h-full w-full"
        :class="
          cellColor === 'cell_blue'
            ? 'path_blue path__' + i
            : cellColor === 'cell_red'
              ? 'path_red path__' + i
              : 'path_none'
        "
      ></div>
    </template>

    <!-- 端のセルの網掛け -->
    <div
      v-if="isInEdge(tileProps.number)"
      class="absolute z-10 h-full w-full bg-white/60"
    ></div>
  </div>
</template>

<script lang="ts" setup scoped>
  import { cellX, cellY, isInEdge } from "~/composables/useCellCoords";
  import { getCell, moveCoordinate } from "~/game/board";
  import type { Direction } from "~/game/types";
  import { useGameStore } from "~/stores/game";
  import { useGameInteractionStore } from "~/stores/gameInteraction";

  const game = useGameStore();
  const interaction = useGameInteractionStore();

  interface Props {
    /**
     * 0~224のセル番号
     */
    number: number;
  }
  const tileProps = defineProps<Props>();

  const coordinate = computed(() => ({
    x: cellX(tileProps.number),
    y: cellY(tileProps.number),
  }));
  const cell = computed(() => getCell(game.displayBoard, coordinate.value));
  const roadLevel = computed(() =>
    cell.value.kind === "road" ? cell.value.level : "",
  );

  const cellColor = computed(() => {
    const [selectedX, selectedY] = interaction.selectedCell;
    if (
      selectedX === coordinate.value.x &&
      selectedY === coordinate.value.y &&
      cell.value.kind === "empty"
    ) {
      return game.state.currentPlayer === "blue"
        ? "cell_blue_selected"
        : "cell_red_selected";
    }

    if (cell.value.kind === "road") {
      return cell.value.color === "blue" ? "cell_blue" : "cell_red";
    }

    return "cell_none";
  });

  /**
   * 周囲の8マスのうち，つながっているマスの番号にtrueが代入される
   *
   * ```
   * 0  1  2
   * 3  -  5
   * 6  7  8
   * ```
   */
  const pathDirections: ReadonlyArray<readonly [number, Direction]> = [
    [0, { x: -1, y: -1 }],
    [1, { x: 0, y: -1 }],
    [2, { x: 1, y: -1 }],
    [3, { x: -1, y: 0 }],
    [5, { x: 1, y: 0 }],
    [6, { x: -1, y: 1 }],
    [7, { x: 0, y: 1 }],
    [8, { x: 1, y: 1 }],
  ];

  const nextCells = computed(() => {
    const result = new Array<boolean>(9).fill(false);
    const currentCell = cell.value;
    if (currentCell.kind !== "road") return result;

    for (const [pathIndex, direction] of pathDirections) {
      const nextCell = getCell(
        game.displayBoard,
        moveCoordinate(coordinate.value, direction),
      );
      result[pathIndex] =
        nextCell.kind === "road" &&
        nextCell.color === currentCell.color &&
        Math.abs(nextCell.level - currentCell.level) <= 1;
    }
    return result;
  });

  /**
   * タイルがクリックされたときの処理
   */
  function clickTile() {
    interaction.selectCell(cellX(tileProps.number), cellY(tileProps.number));
  }
</script>

<style lang="scss">
  :root {
    --blue-color-dark: #1e3a8a;
    --blue-color-light: #8ba0d8;
    --red-color-dark: #8a2b1e;
    --red-color-light: #f5a89e;
    --gray-color: #f4f5f7;
    --path-width: 10%;
  }

  .cell {
    &_none {
      border-color: rgba(0, 0, 0, 0);
      color: rgba(0, 0, 0, 0);
    }

    &_blue {
      border-color: var(--blue-color-dark);
      color: var(--blue-color-dark);
      background-color: var(--blue-color-light);
    }

    &_blue_selected {
      border-color: var(--blue-color-light);
      color: rgba(0, 0, 0, 0);
    }

    &_red {
      border-color: var(--red-color-dark);
      color: var(--red-color-dark);
      background-color: var(--red-color-light);
    }

    &_red_selected {
      border-color: var(--red-color-light);
      color: rgba(0, 0, 0, 0);
    }
  }

  /* pathの番号 */
  /* 0 1 2 */
  /* 3 4 5 */
  /* 6 7 8 */

  .path {
    &_red {
      background-color: var(--red-color-dark);
    }
    &_blue {
      background-color: var(--blue-color-dark);
    }
    &_none {
      background-color: #ffffff00;
    }

    &__0 {
      clip-path: polygon(
        0 0,
        calc(0.705 * var(--path-width)) 0,
        calc(20% + 0.705 * var(--path-width)) 20%,
        20% calc(20% + 0.705 * var(--path-width)),
        0 calc(0.705 * var(--path-width))
      );
    }

    &__1 {
      clip-path: polygon(
        calc(50% - var(--path-width) / 2) 0,
        calc(50% + var(--path-width) / 2) 0,
        calc(50% + var(--path-width) / 2) 10%,
        calc(50% - var(--path-width) / 2) 10%
      );
    }

    &__2 {
      clip-path: polygon(
        100% 0,
        calc(100% - 0.705 * var(--path-width)) 0,
        calc(80% - 0.705 * var(--path-width)) 20%,
        80% calc(20% + 0.705 * var(--path-width)),
        100% calc(0.705 * var(--path-width))
      );
    }

    &__3 {
      clip-path: polygon(
        0 calc(50% - var(--path-width) / 2),
        10% calc(50% - var(--path-width) / 2),
        10% calc(50% + var(--path-width) / 2),
        0 calc(50% + var(--path-width) / 2)
      );
    }

    &__5 {
      clip-path: polygon(
        100% calc(50% - var(--path-width) / 2),
        90% calc(50% - var(--path-width) / 2),
        90% calc(50% + var(--path-width) / 2),
        100% calc(50% + var(--path-width) / 2)
      );
    }

    &__6 {
      clip-path: polygon(
        0 100%,
        calc(0.705 * var(--path-width)) 100%,
        calc(20% + 0.705 * var(--path-width)) 80%,
        20% calc(80% - 0.705 * var(--path-width)),
        0% calc(100% - 0.705 * var(--path-width))
      );
    }

    &__7 {
      clip-path: polygon(
        calc(50% - var(--path-width) / 2) 100%,
        calc(50% + var(--path-width) / 2) 100%,
        calc(50% + var(--path-width) / 2) 90%,
        calc(50% - var(--path-width) / 2) 90%
      );
    }

    &__8 {
      clip-path: polygon(
        100% 100%,
        calc(100% - 0.705 * var(--path-width)) 100%,
        calc(80% - 0.705 * var(--path-width)) 80%,
        80% calc(80% - 0.705 * var(--path-width)),
        100% calc(100% - 0.705 * var(--path-width))
      );
    }
  }
</style>
