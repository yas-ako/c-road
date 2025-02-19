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
      <div v-if="cellData" class="z-5 mx-auto my-auto text-[min(4.2vmin,27px)]">
        {{
          Math.abs(
            tileProps.cellData[cellX(tileProps.number)][
              cellY(tileProps.number)
            ],
          )
        }}
        <!-- {{ tileProps.number }} -->
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
      class="absolute z-10 h-full w-full bg-white bg-opacity-60"
    ></div>
  </div>
</template>

<script lang="ts" setup scoped>
  const isInEdge = (n: number) => {
    // 0~14の範囲にあるか
    if (n >= 0 && n <= 14) return true;

    // 15で割って14余る数か
    if (n % 15 === 14) return true;

    // 15の倍数か
    if (n % 15 === 0) return true;

    // 211~225の範囲にあるか
    if (n >= 210 && n <= 224) return true;

    // いずれの条件にも当てはまらない場合
    return false;
  };

  interface Props {
    /**
     *  1~225の数字の番号
     */
    number: number;

    /**
     * 13*13の二次元配列
     */
    cellData: number[][];

    /**
     * 選択されたセルの座標 [x, y]
     */
    selectedCell: number[];

    /**
     * 手番
     * 1:青 -1:赤
     */
    side: number;
  }
  const tileProps = defineProps<Props>();

  interface Emits {
    // nweCellData [x, y, newNumber]
    (event: "clickTileEmits", clickTileData: [number, number, number]): void;
  }
  const tileEmits = defineEmits<Emits>();

  // セルの色を保存する
  const cellColor = ref<
    | "cell_none"
    | "cell_blue"
    | "cell_red"
    | "cell_blue_selected"
    | "cell_red_selected"
  >("cell_none");

  /**
   * 選択されたセルに入っている数値
   */
  const cellNumber = ref<number>();

  /**
   * 周囲八マスの数値が代入される数値が代入される
   */
  const nextCellList = ref<number[]>(new Array(9).fill(0));

  /**
   * セルがクリックされたときに実行する関数
   */
  function clickTile() {
    // セルに入れることができる最大の整数
    let maxNumber = 0;

    // 周囲8マスの値を取得
    for (let i = 0; i < 9; i++) {
      console.debug("ifの前", i, maxNumber);
      if (maxNumber < Math.abs(nextCellList.value[i])) {
        maxNumber = Math.abs(nextCellList.value[i]);
      }
    }
    maxNumber++; // 隣り合ったセルの最大値より1だけ大きい値まで入力できる
    console.debug("ーーifの後", maxNumber);

    /**
     * 向かい合わせのセルの値が同じ組のうち，最小の値
     */
    let minFacingPair = 1000;

    /**
     * 向かい合わせのセルのリスト
     */
    const fecingCellList = [
      [0, 8],
      [1, 7],
      [2, 6],
      [3, 5],
    ];

    if (false) {
      // 向かい合わせのセルの数値が同じかどうか
      for (const [j, k] of fecingCellList) {
        if (
          Math.abs(nextCellList.value[j]) === Math.abs(nextCellList.value[k]) &&
          Math.abs(nextCellList.value[j]) < minFacingPair
        ) {
          minFacingPair = nextCellList.value[j];
        }
      }

      if (minFacingPair !== 1000) {
        maxNumber = minFacingPair;
      }
    }

    // emitsの呼び出し
    tileEmits("clickTileEmits", [
      // x座標
      cellX(tileProps.number),
      // y座標
      cellY(tileProps.number),
      // セルにおける数値の最大値
      maxNumber,
    ]);
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

  //   watch(() => props.value, (newValue, oldValue) => {
  //   console.log(`値が変わりました: ${oldValue} → ${newValue}`);
  // });

  /**
   * 周囲の8マスのうち，つながっているマスの番号にtrueが代入される
   *
   * ```
   * 0  1  2
   * 3  -  5
   * 6  7  8
   * ```
   */
  const nextCells = ref<boolean[]>(new Array(8).fill(false));

  // 選択されたセルの座標が変化したとき
  // 選択されたセルの見た目を変える
  // 選択されていないセルは，青・赤・0・のいずれかに分類
  watchEffect(() => {
    cellNumber.value =
      tileProps.cellData[cellX(tileProps.number)][cellY(tileProps.number)];
    if (
      tileProps.selectedCell[0] === cellX(tileProps.number) &&
      tileProps.selectedCell[1] === cellY(tileProps.number) &&
      tileProps.cellData[tileProps.selectedCell[0]][
        tileProps.selectedCell[1]
      ] === 0
    ) {
      // セルが選択されている場合
      if (tileProps.side === 1) {
        // 青の時
        cellColor.value = "cell_blue_selected";
      } else {
        // 赤の時
        cellColor.value = "cell_red_selected";
      }
    } else if (cellNumber.value > 0) {
      // セルが選択されておらず，青の時
      cellColor.value = "cell_blue";
    } else if (cellNumber.value < 0) {
      // セルが選択されておらず，赤の時
      cellColor.value = "cell_red";
    } else {
      // セルが選択されておらず，ゼロの時
      cellColor.value = "cell_none";
    }
  });

  // セルに入っている数値が変化したとき
  // 周囲のセルとつながる道を書き換える
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

        // 13を足してから13で割ったあまりをとることで，隣のマスが盤面をはみ出した時，反対側のマス目を参照参照するようにした
        const nextX = (x + dx + 13) % 13;
        const nextY = (y + dy + 13) % 13;

        const nextCellNumber = tileProps.cellData[nextX][nextY];
        nextCellList.value[key] = nextCellNumber;
        // console.debug(nextCellList.value.toString());
        if (
          Math.abs(tileProps.cellData[x][y] - nextCellNumber) <= 1 &&
          nextCellNumber !== 0
        ) {
          nextCells.value[key] = true;
        } else {
          nextCells.value[key] = false;
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
      border-color: rgba(0, 0, 0, 0);
      // color: var(--gray-color);
      // border: none;
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
      // outline: var(--red-color-light);
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
