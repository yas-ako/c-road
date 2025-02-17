<template>
  <main class="mx-4 flex-grow overflow-scroll">
    <div
      class="game-board mx-auto grid h-[160vmin] max-h-[64rem] w-[160vmin] max-w-5xl grid-cols-[repeat(15,minmax(0,1fr))]"
    >
      <!-- <div
        v-for="i in new Array(225)"
        :key="i"
        class="grid-item border-gray-240 border-[1px]"
      > -->
      <!-- <BoardTile /> -->
      <BoardTile
        v-for="(n, index) in 225"
        :key="index"
        class="grid-item border-gray-240 border-[min(0.2vmin,2.048px)]"
        :number="index"
        :cell-data="cellData"
        @click-tile-emits="clickTile"
      />
    </div>
  </main>
  <boardMenu
    :selected-cell="selectedCell"
    :selected-cell-number="selectedCellNumber"
    :max-cell-number="maxCellNumber"
    :is-editable="isEditable"
    @submit-button-on-click-emits="submitButtonOnClick"
  />
</template>

<script setup lang="ts" scoped>
  /**
   * 13*13 のマス目データ 初期値は0
   */
  const cellData = ref<number[][]>(
    [...Array(13)].map((_) => Array(13).fill(0)),
  );

  // for (let i = 0; i < cellData.value.length; i++) {
  //   for (let j = 0; j < cellData.value.length; j++) {
  //     cellData.value[i][j] = 13 * j + i;
  //   }
  // }

  /**
   * 選択されているセルの値
   * `[-1, -1]` の時は選択されていないとき
   */
  const selectedCell = ref([-1, -1]);
  const selectedCellNumber = ref(
    selectedCell.value[0] >= 0
      ? cellData.value[selectedCell.value[0]][selectedCell.value[1]]
      : 1000,
  );

  /**
   * boradTile から呼び出されるEmmits
   */
  const clickTile = (clickTileData: [number, number]): void => {
    // 同じマスが二度クリックされたとき
    if (
      selectedCell.value[0] === clickTileData[0] &&
      selectedCell.value[1] === clickTileData[1]
    ) {
      // 選択解除
      selectedCell.value = [-1, -1];
    } else {
      // クリックされたセルの座標を代入
      [selectedCell.value[0], selectedCell.value[1]] = clickTileData;
    }
  };

  /**
   * セルが選択されているかどうか(数値を入力できるかどうか)
   */
  const isEditable = ref<boolean>(false);

  // 選択されているセルが変わるごとに isEditable に値を代入する
  watchEffect(() => {
    isEditable.value =
      selectedCell.value[0] !== -1 && selectedCell.value[1] !== -1;
  });

  /**
   * 選択されているセルに入力できる値の最大値
   */
  const maxCellNumber = ref(1);

  /**
   * boardMenu からのEmitsがここに来る
   */
  const submitButtonOnClick = (submittedNumber: number): void => {
    cellData.value[selectedCell.value[0]][selectedCell.value[1]] =
      submittedNumber;
  };
</script>

<style scoped>
  .game-board {
    background-color: #f4f5f7;
  }
  /* .grid-item { */
  /* background-color: #c0c0c0; */
  /* } */

  /* .grid-item:nth-child(-n + 15),
  .grid-item:nth-child(15n + 1),
  .grid-item:nth-child(15n + 15),
  .grid-item:nth-last-child(-n + 15) {
    background-color: #d6d6d6;
  } */
</style>
