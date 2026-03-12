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
        {{
          Math.abs(
            game.cellData[cellX(tileProps.number)]?.[
              cellY(tileProps.number)
            ] ?? 0,
          )
        }}
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
  import { DIRECTIONS } from "~/composables/useGameLogic";
  import { useGameStore } from "~/stores/game";

  const game = useGameStore();

  interface Props {
    /**
     * 0~224のセル番号
     */
    number: number;
  }
  const tileProps = defineProps<Props>();

  /**
   * 現在のセルの色
   */
  const cellColor = ref<
    | "cell_none"
    | "cell_blue"
    | "cell_red"
    | "cell_blue_selected"
    | "cell_red_selected"
  >("cell_none");

  /**
   * 周囲の8マスのうち，つながっているマスの番号にtrueが代入される
   *
   * ```
   * 0  1  2
   * 3  -  5
   * 6  7  8
   * ```
   */
  const nextCells = ref<boolean[]>(new Array(9).fill(false));

  /**
   * タイルがクリックされたときの処理
   */
  function clickTile() {
    game.selectCell(cellX(tileProps.number), cellY(tileProps.number));
  }

  // セルの色を更新する
  watchEffect(() => {
    const x = cellX(tileProps.number);
    const y = cellY(tileProps.number);
    const cellNumber = game.cellData[x]?.[y] ?? 0;

    if (
      game.selectedCell[0] === x &&
      game.selectedCell[1] === y &&
      (game.cellData[game.selectedCell[0]]?.[game.selectedCell[1]] ?? -1) === 0
    ) {
      cellColor.value = game.side === 1 ? "cell_blue_selected" : "cell_red_selected";
    } else if (cellNumber > 0) {
      cellColor.value = "cell_blue";
    } else if (cellNumber < 0) {
      cellColor.value = "cell_red";
    } else {
      cellColor.value = "cell_none";
    }
  });

  // 周囲のセルとの道を更新する
  watchEffect(() => {
    const x = cellX(tileProps.number);
    const y = cellY(tileProps.number);

    for (const [keyStr, [dx, dy]] of Object.entries(DIRECTIONS)) {
      const key = Number(keyStr);
      const nextX = (x + dx + 13) % 13;
      const nextY = (y + dy + 13) % 13;

      const currentValue = game.cellData[x]?.[y] ?? 0;
      const nextCellValue = game.cellData[nextX]?.[nextY] ?? 0;

      nextCells.value[key] =
        Math.abs(currentValue - nextCellValue) <= 1 && nextCellValue !== 0;
    }
  });
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
