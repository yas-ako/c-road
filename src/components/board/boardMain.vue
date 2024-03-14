<template>
  <main class="mx-4 overflow-scroll flex-grow">
    <div
      class="game-board gap-[2px] grid grid-cols-[repeat(15,minmax(0,1fr))] w-[160vmin] h-[160vmin] mx-auto max-w-5xl max-h-[64rem]"
    >
      <div v-for="i in new Array(225)" class="shadow-sm grid-item"></div>
    </div>
  </main>
</template>

<script setup></script>

<style>
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
