<template>
  <div class="flex h-full w-full" @click="changeColor">
    <div class="mx-auto my-auto h-5/6 w-5/6" :class="cellColor"></div>
  </div>
</template>

<script setup>
  const cellColor = ref("cell_none");
  function changeColor() {
    cellColor.value = "cell_blue";
  }
</script>

<style>
  .cell_none {
    background-color: #f4f5f7;
  }

  .cell_blue {
    background-color: #1e3a8a;
  }

  .cell_red {
    background-color: #8a2b1e;
  }
</style>
