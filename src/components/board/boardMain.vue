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
        :number="
          cellData[index % 15 === 0 ? 13 : index % 15 === 14 ? 1 : index % 15][
            Math.floor(index / 15) === 0
              ? 13
              : Math.floor(index / 15) === 14
                ? 1
                : Math.floor(index / 15)
          ]
        "
      />
      <!-- :number="cellData[cellX(index)][cellY(index)]" -->
    </div>
  </main>
  <boardMenu />
</template>

<script setup lang="ts">
  const cellData = ref<number[][]>(
    [...Array(13)].map((_) => Array(13).fill(22)),
  );

  /**
   * セルの番号(0~255)をもとに，どのマス目を指すか求める．x座標
   * @param no セルの番号(0~255)
   */
  function cellX(no: number): number {
    const result = remainder(no, 15);
    if (result === 0) {
      return 13;
    } else if (result === 14) {
      return 1;
    } else {
      return result;
    }
  }

  function cellY(no: number): number {
    const result = quotient(no, 15);
    if (result === 0) {
      return 13;
    } else if (result === 14) {
      return 1;
    } else {
      return result;
    }
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
</script>

<style scoped>
  .game-board {
    background-color: #f4f5f7;
  }
  /* .grid-item { */
  /* background-color: #c0c0c0; */
  /* } */

  .grid-item:nth-child(-n + 15),
  .grid-item:nth-child(15n + 1),
  .grid-item:nth-child(15n + 15),
  .grid-item:nth-last-child(-n + 15) {
    background-color: #d6d6d6;
  }
</style>
