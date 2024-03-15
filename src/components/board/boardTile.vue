<template>
  <div class="flex h-full w-full" @click="changeColor">
    <div
      class="mx-auto my-auto flex h-5/6 w-5/6 cursor-grab border-[0.5vmin]"
      :class="cellColor"
    >
      <div class="mx-auto my-auto text-[min(4.2vmin,30px)]">24</div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style>
  .cell_none {
    border-color: #f4f5f7;
    color: #f4f5f7;
  }

  .cell_blue {
    border-color: #1e3a8a;
    color: #1e3a8a;
    background-color: #8ba0d8;
  }

  .cell_red {
    border-color: #8a2b1e;
    color: #8a2b1e;
    background-color: #f5a89e;
  }
</style>
