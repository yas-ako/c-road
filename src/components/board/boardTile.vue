<template>
  <!-- タップできるが見えない枠 -->
  <div class="relative flex h-full w-full select-none" @click="changeColor">
    <!-- 背景色が青と赤に変わる部分 -->
    <div
      class="z-10 mx-auto my-auto flex h-5/6 w-5/6 cursor-grab border-[0.5vmin]"
      :class="cellColor"
    >
      <!-- 数字 -->
      <div class="z-20 mx-auto my-auto text-[min(4.2vmin,30px)]">24</div>
    </div>
    <!-- まわりに伸びる道(8本用意する, 4は無し) -->
    <div
      v-for="i in [0, 1, 2, 3, 5, 6, 7, 8]"
      :key="i"
      class="absolute z-0 h-full w-full"
      :class="
        cellColor === 'cell_blue'
          ? 'path_blue path__' + i
          : cellColor === 'cell_red'
            ? 'path_red path__' + i
            : 'path_none'
      "
    ></div>
  </div>
</template>

<script lang="ts" setup>
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
      border-color: var(--gray-color);
      color: var(--gray-color);
    }

    &_blue {
      border-color: var(--blue-color-dark);
      color: var(--blue-color-dark);
      background-color: var(--blue-color-light);
    }

    &_red {
      border-color: var(--red-color-dark);
      color: var(--red-color-dark);
      background-color: var(--red-color-light);
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
      clip-path: polygon(0 0, 7% 0, 27% 20%, 20% 27%, 0 7%);
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
      clip-path: polygon(100% 0, 93% 0, 73% 20%, 80% 27%, 100% 7%);
    }

    &__3 {
      clip-path: polygon(
        0 calc(50% - var(--path-width) / 2),
        var(--path-width) calc(50% - var(--path-width) / 2),
        var(--path-width) calc(50% + var(--path-width) / 2),
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
      clip-path: polygon(0 100%, 7% 100%, 27% 80%, 20% 73%, 0% 93%);
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
      clip-path: polygon(100% 100%, 93% 100%, 73% 80%, 80% 73%, 100% 93%);
    }
  }
</style>
