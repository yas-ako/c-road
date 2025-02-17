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
  />
</template>

<script setup lang="ts" scoped>
  const cellData = ref<number[][]>(
    [...Array(13)].map((_) => Array(13).fill(0)),
  );

  // for (let i = 0; i < cellData.value.length; i++) {
  //   for (let j = 0; j < cellData.value.length; j++) {
  //     cellData.value[i][j] = 13 * j + i;
  //   }
  // }

  const selectedCell = ref([-1, -1]);
  const selectedCellNumber = ref(
    selectedCell.value[0] >= 0
      ? cellData.value[selectedCell.value[0]][selectedCell.value[1]]
      : 1000,
  );

  const clickTile = (clickTileData: [number, number]): void => {
    // 同じマスが二度クリックされたとき
    if (
      selectedCell.value[0] === clickTileData[0] &&
      selectedCell.value[1] == clickTileData[1]
    ) {
      // 選択解除
      selectedCell.value = [-1, -1];
    } else {
      // クリックされたセルの座標を代入
      [selectedCell.value[0], selectedCell.value[1]] = clickTileData;
    }
  };

  const maxCellNumber = ref(1);
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
