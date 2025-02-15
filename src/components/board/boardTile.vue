<template>
  <!-- タップできるが見えない枠 -->
  <div class="relative flex h-full w-full select-none" @click="changeColor">
    <!-- 背景色が青と赤に変わる部分 -->
    <div
      class="z-10 mx-auto my-auto flex h-5/6 w-5/6 cursor-grab border-[min(0.5vmin,2.5px)]"
      :class="cellColor"
    >
      <!-- 数字 -->
      <div
        v-if="cellData"
        class="z-20 mx-auto my-auto text-[min(4.2vmin,27px)]"
      >
        {{
          tileProps.cellData[cellX(tileProps.number)][cellY(tileProps.number)]
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
  </div>
</template>

<script lang="ts" setup>
  interface Props {
    number: number;
    cellData: number[][];
  }

  const tileProps = defineProps<Props>();

  const cellColor = ref("cell_none");
  function changeColor() {
    if (cellColor.value === "cell_none") {
      cellColor.value = "cell_blue";
    } else if (cellColor.value === "cell_blue") {
      cellColor.value = "cell_red";
    } else {
      cellColor.value = "cell_blue";
    }
  }

  /**
   * セルの番号(0~255)をもとに，どのマス目を指すか求める．x座標
   * @param no セルの番号(0~255)
   */
  function cellX(no: number): number {
    const result = remainder(no, 15);
    let index: number;
    if (result === 0) {
      index = 13;
    } else if (result === 14) {
      index = 1;
    } else {
      index = result;
    }
    return index - 1; // 0～12 に調整
  }

  /**
   * セルの番号(0~255)をもとに，どのマス目を指すか求める．x座標
   * @param no セルの番号(0~255)
   */
  function cellY(no: number): number {
    const result = quotient(no, 15);
    let index: number;
    if (result === 0) {
      index = 13;
    } else if (result === 14) {
      index = 1;
    } else {
      index = result;
    }
    return index - 1; // 0～12 に調整
  }

  /**
   * 商を求める関数
   * @param dividend 割られる数
   * @param divisor 割る数
   */
  function quotient(dividend: number, divisor: number): number {
    return Math.floor(dividend / divisor);
  }

  /**
   * 余りを求める関数
   * @param dividend 割られる数
   * @param divisor 割る数
   */
  function remainder(dividend: number, divisor: number): number {
    return dividend % divisor;
  }

  /**
   * 周囲の8マスのうち，つながっているマスの番号が代入されている配列
   *
   * ```
   * 0  1  2
   * 3  -  5
   * 6  7  8
   * ```
   */
  const nextCells = ref<boolean[]>(new Array(8).fill(false));
  watchEffect(() => {
    const directions: { [key: number]: [number, number] } = {
      0: [-1, -1], // 左上
      1: [0, -1], // 上
      2: [1, -1], // 右上
      3: [-1, 0], // 左
      5: [1, 0], // 右
      6: [-1, 1], // 左下
      7: [0, 1], // 下
      8: [1, 1], // 右下
    };

    for (const key in directions) {
      if (Object.prototype.hasOwnProperty.call(directions, key)) {
        const [x, y] = [cellX(tileProps.number), cellY(tileProps.number)];
        const [dx, dy] = directions[key];
        const nextX = (x + dx + 13) % 13;
        const nextY = (y + dy + 13) % 13;
        const nextCellNumber = tileProps.cellData[nextX][nextY];
        if (
          Math.abs(tileProps.cellData[x][y] - nextCellNumber) <= 1 &&
          nextCellNumber !== 0
        ) {
          nextCells.value[key] = true;
        }
      }
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
      border-color: var(--gray-color);
      color: var(--gray-color);
    }

    &_blue {
      border-color: var(--blue-color-dark);
      color: var(--blue-color-dark);
      background-color: var(--blue-color-light);
    }

    &_red {
      border-color: var(--red-color-dark);
      color: var(--red-color-dark);
      background-color: var(--red-color-light);
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
