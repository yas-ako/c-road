<template>
  <div
    class="BoardTile relative flex h-full w-full select-none"
    @click="changeColor"
  >
    <div
      class="z-10 mx-auto my-auto flex h-5/6 w-5/6 cursor-grab border-[0.5vmin]"
      :class="cellColor"
    >
      <div class="z-20 mx-auto my-auto text-[min(4.2vmin,30px)]">24</div>
    </div>
    <div class="path_1 absolute z-0 h-full w-full"></div>
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
  :root {
    --blue-color-dark: #1e3a8a;
    --blue-color-light: #8ba0d8;
    --red-color-dark: #8a2b1e;
    --red-color-light: #f5a89e;
    --gray-color: #f4f5f7;
  }

  .cell_none {
    border-color: var(--gray-color);
    color: var(--gray-color);
  }

  .cell_blue {
    border-color: var(--blue-color-dark);
    color: var(--blue-color-dark);
    background-color: var(--blue-color-light);
  }

  .cell_red {
    border-color: var(--red-color-dark);
    color: var(--red-color-dark);
    background-color: var(--red-color-light);
  }

  /* pathの番号 */
  /* 0 1 2 */
  /* 3 4 5 */
  /* 6 7 8 */

  .path_1 {
    background-color: v-bind(
      'cellColor === "cell_blue" ? "var(--blue-color-dark)" : cellColor === "cell_red" ? "var(--red-color-dark)" : "var(--gray-color)"'
    );
    clip-path: polygon(45% 0, 55% 0, 55% 10%, 45% 10%);
  }
</style>
