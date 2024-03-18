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
        v-for="i in new Array(225)"
        :key="i"
        class="grid-item border-gray-240 border-[0.2vmin]"
      />
    </div>
  </main>
  <boardMenu />
</template>

<script setup></script>

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
