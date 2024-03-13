<template>
  <main
    class="game-board gap-[2px] grid grid-cols-[repeat(15,minmax(0,1fr))] w-[90vmin] h-[90vmin] max-h-96 max-w-96 flex-grow mx-auto"
  >
    <div v-for="i in new Array(225)" class="grid-item"></div>
  </main>
</template>

<script setup></script>

<style>
.game-board {
  background-color: #e6e6e6;
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
